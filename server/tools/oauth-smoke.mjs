#!/usr/bin/env node
/**
 * End-to-end OAuth check: walks the exact path ChatGPT and claude.ai take.
 *
 *   node tools/oauth-smoke.mjs <base-url> <passphrase> [--trade]
 *
 * Steps: discovery -> dynamic client registration -> consent form -> token
 * exchange (PKCE S256) -> authenticated tools/list. Exits non-zero on failure.
 */
import crypto from "node:crypto";

const [, , baseArg, passphrase, ...flags] = process.argv;
if (!baseArg || !passphrase) {
  console.error("usage: oauth-smoke.mjs <base-url> <passphrase> [--trade]");
  process.exit(2);
}
const base = baseArg.replace(/\/+$/, "");
const wantTrade = flags.includes("--trade");
const REDIRECT = "http://localhost:9999/callback";

const b64url = (b) => b.toString("base64url");
const ok = (label, detail = "") => console.log(`  ok   ${label}${detail ? ` — ${detail}` : ""}`);
const fail = (label, detail) => {
  console.error(`  FAIL ${label} — ${detail}`);
  process.exit(1);
};

// 1. Discovery -----------------------------------------------------------------
console.log("discovery");
const challenge = await fetch(`${base}/mcp`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
});
if (challenge.status !== 401) fail("401 challenge", `got HTTP ${challenge.status}`);
const wwwAuth = challenge.headers.get("www-authenticate") ?? "";
const rmUrl = /resource_metadata="([^"]+)"/.exec(wwwAuth)?.[1];
if (!rmUrl) fail("WWW-Authenticate", `no resource_metadata in: ${wwwAuth}`);
ok("401 + WWW-Authenticate", rmUrl);

const rm = await (await fetch(rmUrl)).json();
if (rm.resource !== `${base}/mcp`) fail("resource matches MCP URL", `got ${rm.resource}`);
ok("protected resource metadata", rm.resource);

const issuer = rm.authorization_servers[0];
const asMeta = await (await fetch(`${issuer}/.well-known/oauth-authorization-server`)).json();
if (!asMeta.code_challenge_methods_supported?.includes("S256")) fail("PKCE S256", "not advertised");
ok("authorization server metadata", `PKCE S256, scopes ${asMeta.scopes_supported?.join(" ")}`);

// 2. Dynamic client registration -----------------------------------------------
console.log("\nregistration");
const regRes = await fetch(asMeta.registration_endpoint, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    client_name: "oauth-smoke",
    redirect_uris: [REDIRECT],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  }),
});
if (!regRes.ok) fail("register client", `HTTP ${regRes.status}: ${await regRes.text()}`);
const client = await regRes.json();
ok("client registered", client.client_id);

// 3. Authorization + consent ----------------------------------------------------
console.log("\nauthorization");
const verifier = b64url(crypto.randomBytes(32));
const codeChallenge = b64url(crypto.createHash("sha256").update(verifier).digest());
const state = b64url(crypto.randomBytes(16));
const scope = wantTrade ? "moomoo:read moomoo:trade" : "moomoo:read";

const authQuery = new URLSearchParams({
  client_id: client.client_id,
  redirect_uri: REDIRECT,
  response_type: "code",
  scope,
  state,
  code_challenge: codeChallenge,
  code_challenge_method: "S256",
  resource: `${base}/mcp`,
});

const formRes = await fetch(`${asMeta.authorization_endpoint}?${authQuery}`);
if (!formRes.ok) fail("consent page", `HTTP ${formRes.status}`);
const html = await formRes.text();
if (!/name="password"/.test(html)) fail("consent page", "no passphrase field rendered");
ok("consent page rendered", wantTrade ? "requesting read + trade" : "requesting read");

// A wrong passphrase must not produce a code.
const badRes = await fetch(asMeta.authorization_endpoint, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ q: authQuery.toString(), password: "definitely-wrong" }),
  redirect: "manual",
});
if (badRes.status === 302) fail("wrong passphrase rejected", "it issued a redirect");
ok("wrong passphrase rejected", `HTTP ${badRes.status}`);

const body = new URLSearchParams({ q: authQuery.toString(), password: passphrase });
if (wantTrade) body.set("trade", "yes");
const consentRes = await fetch(asMeta.authorization_endpoint, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body,
  redirect: "manual",
});
if (consentRes.status !== 302) fail("consent accepted", `HTTP ${consentRes.status}`);
const cbUrl = new URL(consentRes.headers.get("location"));
if (cbUrl.searchParams.get("state") !== state) fail("state echoed", "mismatch");
const code = cbUrl.searchParams.get("code");
if (!code) fail("authorization code", cbUrl.search);
ok("authorization code issued", `state ok, iss=${cbUrl.searchParams.get("iss") ?? "-"}`);

// 4. Token exchange -------------------------------------------------------------
console.log("\ntoken exchange");
const tokenRes = await fetch(asMeta.token_endpoint, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT,
    client_id: client.client_id,
    code_verifier: verifier,
    resource: `${base}/mcp`,
  }),
});
if (!tokenRes.ok) fail("token exchange", `HTTP ${tokenRes.status}: ${await tokenRes.text()}`);
const token = await tokenRes.json();
if (!token.access_token) fail("access token", JSON.stringify(token));
ok("access token issued", `scope="${token.scope}" expires_in=${token.expires_in}`);

// 5. Use the token against MCP ---------------------------------------------------
console.log("\nauthenticated MCP session");
let sessionId = null;
async function rpc(method, params, notification = false) {
  const payload = notification
    ? { jsonrpc: "2.0", method, params }
    : { jsonrpc: "2.0", id: 1, method, params };
  const headers = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    authorization: `Bearer ${token.access_token}`,
    "mcp-protocol-version": "2025-06-18",
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;
  const res = await fetch(`${base}/mcp`, { method: "POST", headers, body: JSON.stringify(payload) });
  const sid = res.headers.get("mcp-session-id");
  if (sid) sessionId = sid;
  if (!res.ok) fail(method, `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  if (notification) return null;
  const text = await res.text();
  for (const line of text.split("\n")) {
    if (line.startsWith("data:")) {
      const j = JSON.parse(line.slice(5).trim());
      if (j.id === 1) return j.error ? fail(method, JSON.stringify(j.error)) : j.result;
    }
  }
  const j = JSON.parse(text);
  return j.error ? fail(method, JSON.stringify(j.error)) : j.result;
}

const init = await rpc("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "oauth-smoke", version: "1.0.0" },
});
ok("initialize", `${init.serverInfo.name} v${init.serverInfo.version}`);
await rpc("notifications/initialized", {}, true);

const { tools } = await rpc("tools/list", {});
const live = tools.filter((t) => ["trade_place_order", "trade_cancel_order", "trade_modify_order"].includes(t.name));
ok("tools/list", `${tools.length} tools; live-trade tools visible: ${live.length}`);

console.log(`\nAll OAuth checks passed against ${base}`);
