/** Where a parameter travels in the HTTP request. */
export type ParamIn = "path" | "query" | "body" | "header";

/** JSON-ish type of a parameter, as inferred from the moomoo docs. */
export type ParamType = "string" | "integer" | "number" | "boolean" | "array" | "object";

export interface Param {
  name: string;
  in: ParamIn;
  type: ParamType;
  /** Element type for `array` params. */
  items?: Exclude<ParamType, "array">;
  required: boolean;
  description: string;
}

/**
 * How much damage a tool can do. Drives the gating in `mcp.ts`:
 * `live_trade` tools move real money and stay unregistered unless explicitly enabled.
 */
export type Risk = "read" | "write" | "sim" | "live_trade";

export interface Endpoint {
  /** MCP tool name, e.g. `quote_history_kline`. */
  tool: string;
  title: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /** moomoo path with `{placeholders}`, e.g. `/api/v1.0/quote/{symbol}/history-kline`. */
  path: string;
  risk: Risk;
  /** Docs page this was generated from, relative to https://open.moomoo.com/. */
  doc: string;
  description: string;
  params: Param[];
}
