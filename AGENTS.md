# moomoo trading agent

An AI trading agent built on the moomoo platform. The agent reaches moomoo through a
remote MCP server that wraps the moomoo OpenAPI and runs on Cloudflare Workers.

```
server/     Cloudflare Worker: the moomoo OpenAPI MCP server  (built)
scripts/    Snapshot moomoo data to JSON for offline study    (todo)
.agents/    skills/ -> ../.claude/skills, for market study     (todo)
```

`CLAUDE.md` is a symlink to this file. Edit `AGENTS.md`.

## Deployment

| | |
| --- | --- |
| MCP endpoint | `https://moomoo-mcp.kingwei-lo.workers.dev/mcp` |
| Health (no auth) | `https://moomoo-mcp.kingwei-lo.workers.dev/health` |
| Cloudflare account | `6b157ecc8f3576699413816fb9a6dc17` |
| Worker | `moomoo-mcp` |

Connecting a client needs the `MCP_AUTH_TOKEN` value as a bearer token.
`.mcp.json` wires this repo up already; export the token first:

```bash
export MOOMOO_MCP_TOKEN=...      # the MCP_AUTH_TOKEN secret
```

Or register it globally:

```bash
claude mcp add moomoo --transport http https://moomoo-mcp.kingwei-lo.workers.dev/mcp \
  --header "Authorization: Bearer $MOOMOO_MCP_TOKEN"
```

### Client support

The server accepts two credentials, so every client has a path in:

| Client | How |
| --- | --- |
| ChatGPT | OAuth — paste the URL in Settings → Apps & Connectors (developer mode) |
| claude.ai web | OAuth — Settings → Connectors → Add custom connector |
| Claude Code | admin token (`--header`) or OAuth |
| Claude Desktop | OAuth, or `mcp-remote` stdio proxy with the admin token |

**OAuth** (`/authorize`, `/oauth/token`, `/oauth/register`) is what browser-hosted
clients need. They discover it automatically: an unauthenticated `/mcp` request returns
`401` with a `WWW-Authenticate` pointer, the client registers itself via DCR or CIMD,
then sends the operator to the consent screen. Authorizing needs the
`OAUTH_LOGIN_PASSWORD` passphrase, and live trading is a separate checkbox there.

**Admin token** (`MCP_AUTH_TOKEN`) is a static bearer token checked before OAuth. It
skips the browser entirely, which is what CLI clients and headless agents want. It
carries every scope.

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "moomoo": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://moomoo-mcp.kingwei-lo.workers.dev/mcp",
               "--header", "Authorization:Bearer YOUR_TOKEN"]
    }
  }
}
```

Note `Authorization:Bearer ...` has no space after the colon — `mcp-remote` splits on the
first colon, and a space breaks the header.

### Verifying OAuth

`tools/oauth-smoke.mjs` walks the same path a browser client does — discovery, dynamic
client registration, consent, PKCE token exchange, then an authenticated `tools/list`.
It also asserts that a wrong passphrase issues no code.

```bash
node tools/oauth-smoke.mjs https://moomoo-mcp.kingwei-lo.workers.dev "$OAUTH_LOGIN_PASSWORD"
node tools/oauth-smoke.mjs https://moomoo-mcp.kingwei-lo.workers.dev "$PASS" --trade
```

Local dev runs over plain HTTP, where RFC 9728 forbids declaring an issuer, so
`src/index.ts` omits `resourceMetadata` unless the origin is HTTPS and lets the provider
derive it. That is dev-only; the deployment always declares it.

### Before the tools return data

The Worker is deployed and serving, but **no moomoo credentials are set yet**, so every
tool currently fails with "No moomoo credentials configured". `/health` reports this as
`"moomooAuth": "unconfigured"`. To finish setup, create an AppKey at
https://open.moomoo.com/dashboard, upload the public half of an Ed25519 key, then:

```bash
cd server
wrangler secret put MOOMOO_APP_KEY        # the AppKey id
wrangler secret put MOOMOO_PRIVATE_KEY    # PKCS#8 PEM, the private half
```

Generate a keypair with:

```bash
openssl genpkey -algorithm ed25519 -out moomoo-priv.pem
openssl pkey -in moomoo-priv.pem -pubout -out moomoo-pub.pem   # upload this one
```

## Layout

### `server/` — the MCP server

A Cloudflare Worker exposing all 86 moomoo REST endpoints as MCP tools.

```
src/catalog.ts   GENERATED. 86 endpoints + params. Never hand-edit.
src/types.ts     Endpoint/Param shapes and the risk classification.
src/schema.ts    Catalog params -> Zod input schema; args -> path/query/body.
src/moomoo.ts    REST client: AppKey request signing, OAuth bearer, clock sync.
src/mcp.ts       McpAgent that registers one tool per endpoint, scope-gated.
src/oauth.ts     Consent screen + passphrase check for the OAuth flow.
src/index.ts     Worker entry: admin token, OAuthProvider, /health.
tools/           Catalog generator, MCP smoke client, OAuth smoke client.
```

The catalog is generated from moomoo's own docs rather than written by hand, so a
moomoo API change is picked up by re-running the generator instead of editing 86
tool definitions. See [Regenerating the catalog](#regenerating-the-catalog).

### `scripts/` — data capture (todo)

Pull the latest info from moomoo and store it as JSON, so market study and
backtests run against a local snapshot instead of burning API quota. Not built yet.

### `.agents/skills/` — market study (todo)

`.agents/skills` is a symlink to `.claude/skills`, so the same skills load whether a
tool looks for Claude-flavoured or agent-flavoured skill directories. Intended for
market-study skills. Empty for now.

### Investment strategy memory (todo)

The agent should remember its investment strategy across sessions. Not designed yet —
decide where it lives (a file here, or the MCP server's Durable Object) before building.

## Conventions

- **Package manager is pnpm.** Not npm — `server/` has a `pnpm-lock.yaml`.
- Symbols are `{market}.{code}`: `US.AAPL`, `HK.00700`, `SH.600519`.
- Most timestamps are Unix **milliseconds**; some fields are seconds.
- Ratios are percentages: `1.23` means 1.23%.
- List endpoints paginate with `next_key` / `limit`.

## Working on the server

```bash
cd server
pnpm install
pnpm dev                 # wrangler dev on :8788
pnpm typecheck
pnpm deploy
```

Local dev reads `server/.dev.vars` (gitignored — copy `.dev.vars.example`).
At minimum set `MCP_AUTH_TOKEN`; without it the server returns 503 by design.

### Verifying it works

`tools/mcp-smoke.mjs` is a dependency-free MCP client. It does a real
handshake — `initialize`, `notifications/initialized`, `tools/list` — and can call a tool:

```bash
node tools/mcp-smoke.mjs http://127.0.0.1:8788/mcp "$MCP_AUTH_TOKEN"

node tools/mcp-smoke.mjs http://127.0.0.1:8788/mcp "$MCP_AUTH_TOKEN" \
  quote_trading_days '{"market":"HK","start":"2026-09-01","end":"2026-09-10"}'
```

`GET /health` needs no auth and reports tool count, live-trading state and whether
moomoo credentials are configured. Use it as the deploy check.

### Regenerating the catalog

When moomoo changes its API, re-mirror the docs and regenerate — do not edit
`src/catalog.ts`:

```bash
cd server
./tools/refresh.sh        # mirror docs -> extract -> generate src/catalog.ts
pnpm typecheck
```

`tools/extract.py` parses the mirrored markdown into `tools/catalog.json`;
`tools/gen_catalog.py` turns that into `src/catalog.ts` and assigns tool names and
risk levels. Review the diff on `src/catalog.ts` before deploying — it is the whole
tool surface.

## Safety rules

These are load-bearing. Do not relax them to make something work.

1. **The server fails closed.** No `MCP_AUTH_TOKEN` secret means it serves 503, not
   an open endpoint. This server can place real orders; an unauthenticated URL is a
   funded trading account exposed to the internet.
2. **Live trading passes two independent gates.** The 5 real-money tools
   (`trade_place_order`, `trade_modify_order`, `trade_cancel_order`,
   `trade_order_confirm`, `trade_order_detail`) are not registered unless
   *both* hold:
   - `MOOMOO_ENABLE_LIVE_TRADING="true"` on the deployment (default `"false"`), and
   - the connection carries the `moomoo:trade` scope — ticked at consent time, or
     implicit for the admin token.

   A connection with no scope information fails closed. Keep both gates; dropping
   either turns a read-only agent into one that can spend money.
3. **Prefer `sim_*` when developing.** They hit moomoo's paper-trading account and
   take a different schema from the live ones — numeric enums (`order_side: 1`=buy)
   and `symbol` rather than `code`. Don't assume the two are interchangeable.
4. **Secrets never land in the repo.** `.dev.vars` is gitignored; production values
   go in `wrangler secret put`. The moomoo private key is a signing key — it is not
   recoverable and must not be logged.
5. **Confirm symbol, side and quantity** before any `trade_*` call.

## Tool naming

One MCP tool per endpoint, prefixed by domain:

| Prefix   | Count | Meaning                                    |
| -------- | ----- | ------------------------------------------ |
| `quote_` | 64    | Market data, research, screening. Read-only |
| `trade_` | 13    | Real account. 8 read, 5 gated real-money    |
| `sim_`   | 9     | Paper trading                               |

## Auth

Two paths into moomoo, both handled by `src/moomoo.ts`:

- **AppKey** (default, server-to-server): signs every request with an Ed25519 or
  RSA-SHA256 private key. The signing string is five `\n`-joined fields —
  timestamp, method, path, query, sha256(body) — and the separators are kept even
  when a field is empty. moomoo rejects a clock skew over 5s, so the client syncs
  against `/api/v1.0/server-time` and retries once on error `-12006`.
- **OAuth**: set `MOOMOO_ACCESS_TOKEN` and it sends `Authorization: Bearer` instead.

## Reference

- moomoo API docs: https://open.moomoo.com/api — machine-readable index at
  https://open.moomoo.com/llms.txt
- moomoo ships its own hosted MCP at `https://mcp.moomoo.com/mcp` (OAuth-only,
  tool list not public). This project exists to get full API coverage and
  server-side AppKey auth instead.
- Cloudflare remote MCP guide:
  https://developers.cloudflare.com/agents/model-context-protocol/guides/remote-mcp-server/
