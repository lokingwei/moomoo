/**
 * The OAuth authorization + consent screen.
 *
 * `@cloudflare/workers-oauth-provider` implements the OAuth 2.1 protocol (tokens,
 * PKCE, DCR/CIMD, metadata discovery). It deliberately does NOT authenticate users —
 * that is this file's job.
 *
 * This is a single-operator server: the one person who owns the moomoo account. So
 * "authentication" is a passphrase held in the OAUTH_LOGIN_PASSWORD secret, and the
 * consent screen additionally requires ticking a box before the live-trading scope is
 * granted.
 */
import type { AuthRequest, OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { AuthorizationError } from "@cloudflare/workers-oauth-provider";

export const SCOPE_READ = "moomoo:read";
export const SCOPE_TRADE = "moomoo:trade";
export const SCOPES_SUPPORTED = [SCOPE_READ, SCOPE_TRADE];

/** The single operator of this server. */
const USER_ID = "operator";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function page(title: string, body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; --fg:#111; --bg:#fff; --muted:#666; --line:#d8d8d8; --accent:#1a56db; --warn:#9a3412; --warnbg:#fff7ed }
  @media (prefers-color-scheme: dark) {
    :root { --fg:#e8e8e8; --bg:#16181c; --muted:#9aa0a6; --line:#33363c; --accent:#7aa2f7; --warn:#fdba74; --warnbg:#2a1f18 }
  }
  * { box-sizing: border-box }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:var(--bg); color:var(--fg); padding:24px;
         font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif }
  .card { width:100%; max-width:420px; border:1px solid var(--line); border-radius:12px; padding:28px }
  h1 { font-size:19px; margin:0 0 4px }
  .sub { color:var(--muted); font-size:13px; margin:0 0 20px }
  .row { margin:16px 0 }
  label { display:block; font-weight:600; font-size:13px; margin-bottom:6px }
  input[type=password] { width:100%; padding:10px 12px; font-size:15px; border-radius:8px;
                         border:1px solid var(--line); background:var(--bg); color:var(--fg) }
  .scopes { border:1px solid var(--line); border-radius:8px; padding:12px; margin:16px 0 }
  .scope { display:flex; gap:9px; align-items:flex-start; font-size:13px; margin:9px 0 }
  .scope:first-child { margin-top:0 } .scope:last-child { margin-bottom:0 }
  .scope span { color:var(--muted) }
  .warn { background:var(--warnbg); border:1px solid var(--warn); color:var(--warn);
          border-radius:8px; padding:10px 12px; font-size:13px; margin:16px 0 }
  button { width:100%; padding:11px; font-size:15px; font-weight:600; cursor:pointer;
           border:0; border-radius:8px; background:var(--accent); color:#fff }
  .err { color:#b91c1c; font-size:13px; margin:12px 0 0 }
  code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px }
</style></head><body><div class="card">${body}</div></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function consentPage(clientName: string, query: string, error?: string): Response {
  return page(
    "Authorize moomoo MCP",
    `<h1>Authorize access</h1>
     <p class="sub"><strong>${escapeHtml(clientName)}</strong> wants to connect to your moomoo MCP server.</p>
     <form method="POST" action="/authorize">
       <input type="hidden" name="q" value="${escapeHtml(query)}">
       <div class="scopes">
         <div class="scope"><input type="checkbox" checked disabled>
           <div><strong>Market data &amp; account reads</strong><br>
           <span>Quotes, research, screening, positions, orders, balances.</span></div></div>
         <div class="scope"><input type="checkbox" name="trade" value="yes" id="trade">
           <div><label for="trade" style="display:inline;font-weight:600">Live trading</label><br>
           <span>Place, modify and cancel <strong>real-money</strong> orders. Leave unchecked unless you need it.</span></div></div>
       </div>
       <div class="row">
         <label for="pw">Access passphrase</label>
         <input type="password" id="pw" name="password" autocomplete="current-password" autofocus required>
       </div>
       ${error ? `<p class="err">${escapeHtml(error)}</p>` : ""}
       <button type="submit">Authorize</button>
     </form>`,
    error ? 401 : 200,
  );
}

/** Turn a validation failure into either a local error page or an OAuth error redirect. */
function authorizationErrorResponse(error: AuthorizationError): Response {
  if (!error.redirectUri) {
    // The client or its redirect URI could not be validated: never redirect.
    return page("Authorization error", `<h1>Authorization error</h1><p class="sub">${escapeHtml(error.description)}</p>`, 400);
  }
  const redirect = new URL(error.redirectUri);
  redirect.searchParams.set("error", error.code);
  redirect.searchParams.set("error_description", error.description);
  if (error.state) redirect.searchParams.set("state", error.state);
  if (error.issuer) redirect.searchParams.set("iss", error.issuer);
  return Response.redirect(redirect.toString(), 302);
}

async function parse(
  env: Env,
  url: string,
): Promise<{ req: AuthRequest } | { response: Response }> {
  try {
    return { req: await env.OAUTH_PROVIDER.parseAuthRequest(new Request(url)) };
  } catch (err) {
    if (!(err instanceof AuthorizationError)) throw err;
    return { response: authorizationErrorResponse(err) };
  }
}

export async function handleAuthorize(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET") {
    const parsed = await parse(env, request.url);
    if ("response" in parsed) return parsed.response;

    const client = await env.OAUTH_PROVIDER.lookupClient(parsed.req.clientId);
    if (!client) return page("Unknown client", `<h1>Unknown OAuth client</h1>`, 400);

    return consentPage(client.clientName || parsed.req.clientId, url.search.replace(/^\?/, ""));
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, POST" } });
  }

  const form = await request.formData();
  const query = String(form.get("q") ?? "");
  const password = String(form.get("password") ?? "");
  const wantsTrade = form.get("trade") === "yes";

  // Re-parse the original request rather than trusting the posted copy: this
  // re-validates the client and redirect URI against storage, so a tampered
  // hidden field is rejected here.
  const parsed = await parse(env, `${url.origin}/authorize?${query}`);
  if ("response" in parsed) return parsed.response;
  const authRequest = parsed.req;

  const expected = env.OAUTH_LOGIN_PASSWORD;
  if (!expected) {
    return page(
      "Not configured",
      `<h1>Server not configured</h1>
       <p class="sub">No <code>OAUTH_LOGIN_PASSWORD</code> secret is set, so no one can be
       authorized. Run <code>wrangler secret put OAUTH_LOGIN_PASSWORD</code>.</p>`,
      503,
    );
  }

  if (!password || !safeEqual(password, expected)) {
    const client = await env.OAUTH_PROVIDER.lookupClient(authRequest.clientId);
    return consentPage(client?.clientName || authRequest.clientId, query, "Incorrect passphrase.");
  }

  // Grant only what was both requested and consented to. Live trading is opt-in
  // per authorization, so a read-only client never receives it.
  const granted = authRequest.scope.filter(
    (s) => s === SCOPE_READ || (s === SCOPE_TRADE && wantsTrade),
  );
  if (!granted.includes(SCOPE_READ)) granted.push(SCOPE_READ);

  const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
    request: authRequest,
    userId: USER_ID,
    metadata: { clientName: (await env.OAUTH_PROVIDER.lookupClient(authRequest.clientId))?.clientName },
    scope: granted,
    props: { userId: USER_ID, scope: granted },
  });

  return Response.redirect(redirectTo, 302);
}

export type { OAuthHelpers };
