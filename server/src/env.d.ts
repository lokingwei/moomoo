/**
 * Secrets are not declared in wrangler.jsonc, so `wrangler types` cannot see them.
 * Declare them here and keep this file in sync with the secret list in wrangler.jsonc.
 */
import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider";

export {};

declare global {
  interface Env {
    /** Passphrase for the OAuth consent screen. Required for the OAuth flow. */
    OAUTH_LOGIN_PASSWORD?: string;
    /** Injected by OAuthProvider into handlers it wraps. */
    OAUTH_PROVIDER: OAuthHelpers;
    // MCP_AUTH_TOKEN is declared by `wrangler types` (it appears in .dev.vars).
    // It is still optional at runtime; the code treats a falsy value as "not set".
    /** AppKey auth: the AppKey id. */
    MOOMOO_APP_KEY?: string;
    /** AppKey auth: PKCS#8 PEM private key. */
    MOOMOO_PRIVATE_KEY?: string;
    /** OAuth auth: access token, used instead of AppKey signing. */
    MOOMOO_ACCESS_TOKEN?: string;
    /** Override the moomoo API host (defaults to https://webapi.moomoo.com). */
    MOOMOO_BASE_URL?: string;
  }
}
