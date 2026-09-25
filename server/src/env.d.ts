/**
 * Secrets are not declared in wrangler.jsonc, so `wrangler types` cannot see them.
 * Declare them here and keep this file in sync with the secret list in wrangler.jsonc.
 */
import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider";

export {};

declare global {
  interface Env {
    /**
     * Passphrase for the OAuth consent screen. Required for the OAuth flow.
     * Typed `string`, not optional, because `wrangler types` also declares it when it
     * appears in .dev.vars and the two must agree. A falsy value still means unset.
     */
    OAUTH_LOGIN_PASSWORD: string;
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
    /**
     * Override the moomoo API host (defaults to https://webapi.moomoo.com). Behind the
     * MOOMOO_EGRESS binding this only changes the Host/SNI sent; the VPC service's
     * own hostname decides where the request actually goes.
     */
    MOOMOO_BASE_URL?: string;
  }
}
