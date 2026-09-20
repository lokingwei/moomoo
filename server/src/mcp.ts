import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { ENDPOINTS } from "./catalog";
import { MoomooClient, DEFAULT_BASE_URL, type SignAlg } from "./moomoo";
import { inputShape, toRequest } from "./schema";
import type { Endpoint } from "./types";

const DOCS_BASE = "https://open.moomoo.com/";

const SCOPE_TRADE = "moomoo:trade";

/**
 * What the caller is allowed to reach. Props come from the OAuth grant; a request
 * carrying no props arrived via the static admin token, which is full access.
 */
export interface AuthProps extends Record<string, unknown> {
  userId: string;
  scope: string[];
}

/**
 * Live-trading tools need BOTH gates: the deployment-wide opt-in, and the trade
 * scope on this connection (granted at consent time, or carried by the admin
 * token). Anything else — including a connection with no props at all — fails closed.
 */
function isEnabled(endpoint: Endpoint, env: Env, props: AuthProps | undefined): boolean {
  if (endpoint.risk !== "live_trade") return true;
  if (env.MOOMOO_ENABLE_LIVE_TRADING !== "true") return false;
  return props?.scope?.includes(SCOPE_TRADE) === true;
}

function clientFor(env: Env): MoomooClient {
  return new MoomooClient(
    {
      appKey: env.MOOMOO_APP_KEY,
      privateKeyPem: env.MOOMOO_PRIVATE_KEY,
      alg: (env.MOOMOO_SIGN_ALG as SignAlg) || "Ed25519",
      accessToken: env.MOOMOO_ACCESS_TOKEN,
    },
    env.MOOMOO_BASE_URL || DEFAULT_BASE_URL,
  );
}

/** Long descriptions crowd the model's context; keep tool text tight but sourced. */
function describe(e: Endpoint): string {
  const risk =
    e.risk === "live_trade"
      ? " WARNING: places or alters REAL orders with real money."
      : e.risk === "sim"
        ? " Operates on a simulated (paper) trading account."
        : "";
  return `${e.description}${risk}\n\n${e.method} ${e.path}\nDocs: ${DOCS_BASE}${e.doc}`;
}

export class MoomooMCP extends McpAgent<Env, never, AuthProps> {
  server = new McpServer(
    { name: "moomoo-openapi", version: "0.1.0" },
    {
      instructions:
        "Tools wrapping the moomoo OpenAPI (https://open.moomoo.com/api).\n" +
        "Symbols use `{market}.{code}` — e.g. US.AAPL, HK.00700, SH.600519.\n" +
        "Most timestamps are Unix milliseconds; ratios are percentages (1.23 = 1.23%).\n" +
        "`quote_*` = market data, `trade_*` = REAL money, `sim_*` = paper trading.\n" +
        "Prefer sim_* when testing. Always confirm symbol, side and quantity before any trade_* call.",
    },
  );

  async init() {
    const env = this.env;
    const client = clientFor(env);
    const props = this.props;

    for (const endpoint of ENDPOINTS) {
      if (!isEnabled(endpoint, env, props)) continue;

      this.server.registerTool(
        endpoint.tool,
        {
          title: endpoint.title,
          description: describe(endpoint),
          inputSchema: inputShape(endpoint),
          annotations: {
            readOnlyHint: endpoint.risk === "read",
            destructiveHint: endpoint.risk === "live_trade",
            openWorldHint: true,
          },
        },
        async (args: Record<string, unknown>) => {
          try {
            const spec = toRequest(endpoint, args ?? {});
            const res = await client.request(spec);

            // moomoo signals failure both by HTTP status and by an in-body code.
            const body = res.data as { code?: number; ret_code?: number; s?: string } | null;
            const failed =
              !res.ok ||
              (typeof body?.code === "number" && body.code !== 0) ||
              (typeof body?.ret_code === "number" && body.ret_code !== 0) ||
              body?.s === "error";

            // Pass moomoo's body through untouched: account_id / order_id exceed
            // JavaScript's safe integer range, so re-serializing would corrupt them.
            return {
              isError: failed,
              content: [
                {
                  type: "text" as const,
                  text: (failed ? `moomoo API error (HTTP ${res.status})\n` : "") + res.raw,
                },
              ],
            };
          } catch (err) {
            return {
              isError: true,
              content: [
                { type: "text" as const, text: `${endpoint.tool} failed: ${(err as Error).message}` },
              ],
            };
          }
        },
      );
    }
  }
}
