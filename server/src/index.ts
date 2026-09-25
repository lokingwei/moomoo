import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import { ENDPOINTS } from "./catalog";
import { MoomooMCP } from "./mcp";
import { handleAuthorize, SCOPES_SUPPORTED, SCOPE_READ, SCOPE_TRADE } from "./oauth";
import type { AuthProps } from "./mcp";

export { MoomooMCP };

/**
 * The static admin token is the operator's own credential, so it carries every
 * scope. Live trading still requires the MOOMOO_ENABLE_LIVE_TRADING deployment flag.
 */
const ADMIN_PROPS: AuthProps = { userId: "admin", scope: [SCOPE_READ, SCOPE_TRADE] };

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/**
 * The static admin token: a shortcut for CLI clients that can set a header
 * (Claude Code, scripts, the smoke tester) so they don't need a browser OAuth
 * dance. It grants everything, bypassing the OAuth layer entirely.
 */
function isAdminToken(request: Request, env: Env): boolean {
  const expected = env.MCP_AUTH_TOKEN;
  if (!expected) return false;
  const m = /^Bearer\s+(.+)$/i.exec((request.headers.get("authorization") ?? "").trim());
  return m ? safeEqual(m[1].trim(), expected) : false;
}

function healthResponse(env: Env): Response {
  const live = env.MOOMOO_ENABLE_LIVE_TRADING === "true";
  return json({
    status: "ok",
    server: "moomoo-openapi-mcp",
    tools: ENDPOINTS.filter((e) => e.risk !== "live_trade" || live).length,
    toolsTotal: ENDPOINTS.length,
    liveTrading: live,
    moomooAuth: env.MOOMOO_ACCESS_TOKEN
      ? "oauth"
      : env.MOOMOO_APP_KEY && env.MOOMOO_PRIVATE_KEY
        ? "appkey"
        : "unconfigured",
    // "direct" means Cloudflare's shared IPs, which moomoo will not accept.
    moomooEgress: env.MOOMOO_EGRESS ? "tunnel" : "direct",
    clientAuth: {
      oauth: Boolean(env.OAUTH_LOGIN_PASSWORD),
      adminToken: Boolean(env.MCP_AUTH_TOKEN),
      scopes: SCOPES_SUPPORTED,
    },
    endpoints: { mcp: "/mcp", sse: "/sse", authorize: "/authorize", token: "/oauth/token" },
  });
}

/**
 * Everything the OAuth provider does not treat as a protected API route:
 * the consent screen, health, and 404s.
 */
const defaultHandler: ExportedHandler<Env> = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") return healthResponse(env);
    if (url.pathname === "/authorize") return handleAuthorize(request, env);

    return json(
      { error: "not_found", endpoints: ["/health", "/mcp", "/sse", "/authorize"] },
      404,
    );
  },
};

function serverUrl(env: Env, url: URL): string {
  return env.PUBLIC_URL || url.origin;
}

/** One provider per origin, reused for the life of the isolate. */
const providers = new Map<string, OAuthProvider<Env>>();

/**
 * `resourceMetadata.resource` must match the MCP URL exactly as the client typed it,
 * so the provider is keyed on the public origin.
 */
function buildProvider(env: Env, url: URL): OAuthProvider<Env> {
  const origin = serverUrl(env, url);
  const cached = providers.get(origin);
  if (cached) return cached;

  const provider = new OAuthProvider<Env>({
    apiHandlers: {
      "/mcp": MoomooMCP.serve("/mcp", { binding: "MOOMOO_MCP" }),
      "/sse": MoomooMCP.serveSSE("/sse", { binding: "MOOMOO_MCP" }),
    },
    defaultHandler,

    authorizeEndpoint: "/authorize",
    tokenEndpoint: "/oauth/token",
    // MCP 2026-07-28 prefers CIMD, but ChatGPT and Claude's web connector still
    // register dynamically, so keep both paths open.
    clientRegistrationEndpoint: "/oauth/register",
    clientIdMetadataDocumentEnabled: true,

    scopesSupported: SCOPES_SUPPORTED,
    // RFC 9728 requires HTTPS issuers, so this can only be declared for the real
    // deployment. Over plain-HTTP local dev the provider derives its own metadata.
    ...(origin.startsWith("https://")
      ? {
          resourceMetadata: {
            resource: `${origin}/mcp`,
            authorization_servers: [origin],
            scopes_supported: SCOPES_SUPPORTED,
            bearer_methods_supported: ["header" as const],
            resource_name: "moomoo OpenAPI MCP",
          },
        }
      : {}),
  });

  providers.set(origin, provider);
  return provider;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Open, and deliberately free of anything sensitive.
    if (url.pathname === "/health") return healthResponse(env);

    // Admin-token shortcut, checked before OAuth so header-capable clients keep working.
    if ((url.pathname === "/mcp" || url.pathname === "/sse") && isAdminToken(request, env)) {
      const handler =
        url.pathname === "/mcp"
          ? MoomooMCP.serve("/mcp", { binding: "MOOMOO_MCP" })
          : MoomooMCP.serveSSE("/sse", { binding: "MOOMOO_MCP" });
      // `ctx.props` is readonly and only OAuthProvider populates it, so hand the
      // agent a delegating context carrying full-access props. Without this the
      // agent sees an empty props object and hides the live-trading tools.
      const adminCtx = {
        props: ADMIN_PROPS,
        waitUntil: ctx.waitUntil.bind(ctx),
        passThroughOnException: ctx.passThroughOnException.bind(ctx),
      } as unknown as ExecutionContext;
      return handler.fetch(request, env, adminCtx);
    }

    return buildProvider(env, url).fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
