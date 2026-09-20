/**
 * Minimal moomoo OpenAPI client for Workers.
 *
 * Supports both documented auth methods:
 *   - AppKey  : asymmetric request signing (Ed25519 or RSA-SHA256)
 *   - OAuth   : `Authorization: Bearer <access_token>`
 *
 * Docs: https://open.moomoo.com/api/overview/getting-started
 */

export const DEFAULT_BASE_URL = "https://webapi.moomoo.com";

export type SignAlg = "Ed25519" | "RSA-SHA256";

export interface MoomooAuth {
  /** AppKey id, sent as `X-Api-Key`. */
  appKey?: string;
  /** PKCS#8 PEM private key matching the public key uploaded for the AppKey. */
  privateKeyPem?: string;
  alg?: SignAlg;
  /** OAuth access token, used instead of AppKey signing when present. */
  accessToken?: string;
}

export interface RequestSpec {
  method: string;
  /** Path with `{placeholders}` already substituted. */
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export interface MoomooResponse {
  status: number;
  ok: boolean;
  /**
   * The response body exactly as moomoo sent it. Always prefer this when returning
   * data to a caller: moomoo uses integer ids well past Number.MAX_SAFE_INTEGER
   * (account_id, order_id), and round-tripping them through JSON.parse silently
   * corrupts the low digits.
   */
  raw: string;
  /** Parsed body. Safe for checking status codes, NOT for reading large ids. */
  data: unknown;
  traceId?: string;
}

const PEM_BODY = /-----BEGIN [^-]+-----([\s\S]*?)-----END [^-]+-----/;

function pemToPkcs8(pem: string): ArrayBuffer {
  const m = PEM_BODY.exec(pem.trim());
  const b64 = (m ? m[1] : pem).replace(/\s+/g, "");
  if (!b64) throw new Error("private key is empty or not valid PEM");
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

function toBase64(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  // `data` is a view over a plain ArrayBuffer, so this cast is safe.
  const digest = await crypto.subtle.digest("SHA-256", data as unknown as ArrayBuffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Build the canonical signing string:
 *   timestamp \n METHOD \n path \n query \n sha256hex(body)
 * Every separator is kept even when a field is empty.
 */
export function signingString(
  timestampMs: string,
  method: string,
  path: string,
  queryString: string,
  bodyHashHex: string,
): string {
  return [timestampMs, method.toUpperCase(), path, queryString, bodyHashHex].join("\n");
}

/** Private keys are expensive to import, so keep them per isolate. */
const keyCache = new Map<string, CryptoKey>();

async function importKey(pem: string, alg: SignAlg): Promise<CryptoKey> {
  const cacheKey = `${alg}:${pem.length}:${pem.slice(-48)}`;
  const hit = keyCache.get(cacheKey);
  if (hit) return hit;

  const pkcs8 = pemToPkcs8(pem);
  let key: CryptoKey;
  if (alg === "Ed25519") {
    // Workers exposes Ed25519 under both the standard name and the legacy NODE-ED25519.
    try {
      key = await crypto.subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, false, ["sign"]);
    } catch {
      key = await crypto.subtle.importKey(
        "pkcs8",
        pkcs8,
        { name: "NODE-ED25519", namedCurve: "NODE-ED25519" } as unknown as SubtleCryptoImportKeyAlgorithm,
        false,
        ["sign"],
      );
    }
  } else {
    key = await crypto.subtle.importKey(
      "pkcs8",
      pkcs8,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  keyCache.set(cacheKey, key);
  return key;
}

async function sign(pem: string, alg: SignAlg, message: string): Promise<string> {
  const key = await importKey(pem, alg);
  const bytes = new TextEncoder().encode(message);
  const algo = alg === "Ed25519" ? key.algorithm.name : "RSASSA-PKCS1-v1_5";
  const sig = await crypto.subtle.sign(algo, key, bytes as unknown as ArrayBuffer);
  return toBase64(sig);
}

function nonce(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * Serialize query params. The signature must cover the exact string that is sent,
 * so the caller uses this same value for both.
 */
export function buildQuery(query: RequestSpec["query"]): string {
  if (!query) return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.join("&");
}

export class MoomooClient {
  #auth: MoomooAuth;
  #baseUrl: string;
  /** serverTime - localTime, in ms. moomoo rejects requests skewed by >5s. */
  #clockOffsetMs = 0;
  #clockSyncedAt = 0;

  constructor(auth: MoomooAuth, baseUrl: string = DEFAULT_BASE_URL) {
    this.#auth = auth;
    this.#baseUrl = baseUrl.replace(/\/+$/, "");
  }

  get hasCredentials(): boolean {
    return Boolean(this.#auth.accessToken || (this.#auth.appKey && this.#auth.privateKeyPem));
  }

  get authMode(): "oauth" | "appkey" | "none" {
    if (this.#auth.accessToken) return "oauth";
    if (this.#auth.appKey && this.#auth.privateKeyPem) return "appkey";
    return "none";
  }

  /**
   * Keep our clock aligned with moomoo's. A Worker isolate's `Date.now()` only advances
   * on I/O, so a long-lived isolate can drift past the 5s signature window (error -12006).
   */
  async #syncClock(force = false): Promise<void> {
    const age = Date.now() - this.#clockSyncedAt;
    if (!force && this.#clockSyncedAt && age < 5 * 60_000) return;
    try {
      const res = await fetch(`${this.#baseUrl}/api/v1.0/server-time`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) return;
      const json = (await res.json()) as { server_time_ms?: string | number };
      const server = Number(json.server_time_ms);
      if (Number.isFinite(server)) {
        this.#clockOffsetMs = server - Date.now();
        this.#clockSyncedAt = Date.now();
      }
    } catch {
      // Non-fatal: fall back to local time.
    }
  }

  async request(spec: RequestSpec, retriedForClock = false): Promise<MoomooResponse> {
    if (!this.hasCredentials) {
      throw new Error(
        "No moomoo credentials configured. Set MOOMOO_APP_KEY + MOOMOO_PRIVATE_KEY, " +
          "or MOOMOO_ACCESS_TOKEN, as Worker secrets.",
      );
    }

    const method = spec.method.toUpperCase();
    const queryString = buildQuery(spec.query);
    const url = `${this.#baseUrl}${spec.path}${queryString ? `?${queryString}` : ""}`;

    const headers: Record<string, string> = { accept: "application/json" };
    let bodyBytes: Uint8Array | undefined;
    if (spec.body !== undefined && method !== "GET" && method !== "DELETE") {
      bodyBytes = new TextEncoder().encode(JSON.stringify(spec.body));
      headers["content-type"] = "application/json";
    }

    if (this.#auth.accessToken) {
      headers["authorization"] = `Bearer ${this.#auth.accessToken}`;
    } else {
      await this.#syncClock();
      const ts = String(Date.now() + this.#clockOffsetMs);
      const bodyHash = bodyBytes ? await sha256Hex(bodyBytes) : "";
      const message = signingString(ts, method, spec.path, queryString, bodyHash);
      const alg = this.#auth.alg ?? "Ed25519";
      headers["x-api-key"] = this.#auth.appKey!;
      headers["x-timestamp"] = ts;
      headers["x-nonce"] = nonce();
      headers["authorization"] = await sign(this.#auth.privateKeyPem!, alg, message);
    }

    const res = await fetch(url, {
      method,
      headers,
      body: bodyBytes ? (bodyBytes as unknown as BodyInit) : undefined,
    });

    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // Leave `data` as raw text.
    }

    // A stale clock is the one failure we can fix and retry automatically. Once only.
    const code = (data as { code?: number } | null)?.code;
    if (!retriedForClock && res.status === 401 && code === -12006 && this.authMode === "appkey") {
      await this.#syncClock(true);
      return this.request(spec, true);
    }

    return {
      status: res.status,
      ok: res.ok,
      raw: text,
      data,
      traceId: (data as { trace_id?: string } | null)?.trace_id,
    };
  }
}
