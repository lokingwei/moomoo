#!/usr/bin/env node
/**
 * Minimal MCP Streamable-HTTP client for smoke-testing the deployed server.
 *
 *   node tools/mcp-smoke.mjs <url> <token>                    # handshake + list tools
 *   node tools/mcp-smoke.mjs <url> <token> <tool> '<json>'    # also call one tool
 *
 * Example:
 *   node tools/mcp-smoke.mjs http://127.0.0.1:8788/mcp dev-token \
 *     quote_trading_days '{"market":"HK","start":"2026-09-01","end":"2026-09-10"}'
 */

const [, , url, token, toolName, toolArgsRaw] = process.argv;

if (!url || !token) {
  console.error("usage: mcp-smoke.mjs <url> <token> [tool] [jsonArgs]");
  process.exit(2);
}

const PROTOCOL_VERSION = "2025-06-18";
let sessionId = null;
let nextId = 1;

/** Streamable HTTP replies with either JSON or an SSE stream; accept both. */
function parseBody(contentType, text) {
  if (contentType.includes("text/event-stream")) {
    const messages = [];
    for (const chunk of text.split("\n\n")) {
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data:")) {
          try {
            messages.push(JSON.parse(line.slice(5).trim()));
          } catch {
            /* ignore keep-alives */
          }
        }
      }
    }
    return messages;
  }
  return text ? [JSON.parse(text)] : [];
}

async function rpc(method, params, { notification = false } = {}) {
  const body = notification
    ? { jsonrpc: "2.0", method, params }
    : { jsonrpc: "2.0", id: nextId++, method, params };

  const headers = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    authorization: `Bearer ${token}`,
    "mcp-protocol-version": PROTOCOL_VERSION,
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

  const sid = res.headers.get("mcp-session-id");
  if (sid) sessionId = sid;

  if (!res.ok) {
    throw new Error(`${method} -> HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
  if (notification) return null;

  const messages = parseBody(res.headers.get("content-type") ?? "", await res.text());
  const reply = messages.find((m) => m.id === body.id);
  if (!reply) throw new Error(`${method}: no reply in response`);
  if (reply.error) throw new Error(`${method}: ${JSON.stringify(reply.error)}`);
  return reply.result;
}

const init = await rpc("initialize", {
  protocolVersion: PROTOCOL_VERSION,
  capabilities: {},
  clientInfo: { name: "moomoo-smoke", version: "1.0.0" },
});
console.log(`server:   ${init.serverInfo.name} v${init.serverInfo.version}`);
console.log(`protocol: ${init.protocolVersion}`);
console.log(`session:  ${sessionId ?? "(stateless)"}`);

await rpc("notifications/initialized", {}, { notification: true });

const { tools } = await rpc("tools/list", {});
console.log(`\ntools:    ${tools.length}`);
const groups = {};
for (const t of tools) {
  const g = t.name.split("_")[0];
  groups[g] = (groups[g] ?? 0) + 1;
}
console.log(`groups:   ${Object.entries(groups).map(([k, v]) => `${k}=${v}`).join("  ")}`);

const sample = tools[0];
console.log(`\nexample tool: ${sample.name}`);
console.log(`  required: ${JSON.stringify(sample.inputSchema?.required ?? [])}`);

if (toolName) {
  const args = toolArgsRaw ? JSON.parse(toolArgsRaw) : {};
  console.log(`\ncalling ${toolName} ${JSON.stringify(args)}`);
  const result = await rpc("tools/call", { name: toolName, arguments: args });
  console.log(`isError:  ${result.isError === true}`);
  for (const c of result.content ?? []) {
    console.log(c.type === "text" ? c.text.slice(0, 1500) : JSON.stringify(c).slice(0, 400));
  }
  if (result.isError) process.exitCode = 1;
}
