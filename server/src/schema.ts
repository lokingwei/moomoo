import { z, type ZodRawShape, type ZodTypeAny } from "zod";
import type { RequestSpec } from "./moomoo";
import type { Endpoint, Param, ParamType } from "./types";

function base(type: ParamType, items?: Exclude<ParamType, "array">): ZodTypeAny {
  switch (type) {
    case "integer":
      return z.number().int();
    case "number":
      return z.number();
    case "boolean":
      return z.boolean();
    case "object":
      return z.record(z.string(), z.unknown());
    case "array":
      return z.array(items && items !== "object" ? base(items) : z.unknown());
    default:
      return z.string();
  }
}

/** Build the Zod shape MCP advertises as a tool's input schema. */
export function inputShape(endpoint: Endpoint): ZodRawShape {
  const shape: Record<string, ZodTypeAny> = {};
  for (const p of endpoint.params) {
    let field = base(p.type, p.items);
    if (p.description) field = field.describe(p.description);
    shape[p.name] = p.required ? field : field.optional();
  }
  return shape as ZodRawShape;
}

/** Split validated tool arguments back into path / query / body, per the docs. */
export function toRequest(endpoint: Endpoint, args: Record<string, unknown>): RequestSpec {
  let path = endpoint.path;
  const query: Record<string, string | number | boolean> = {};
  const body: Record<string, unknown> = {};

  const byName = new Map<string, Param>(endpoint.params.map((p) => [p.name, p]));

  for (const [name, value] of Object.entries(args)) {
    if (value === undefined || value === null) continue;
    const param = byName.get(name);
    if (!param) continue;

    switch (param.in) {
      case "path":
        path = path.replace(`{${name}}`, encodeURIComponent(String(value)));
        break;
      case "query":
        // Arrays and objects can only ride in a query string as JSON.
        query[name] =
          typeof value === "object" ? JSON.stringify(value) : (value as string | number | boolean);
        break;
      case "body":
      case "header":
        body[name] = value;
        break;
    }
  }

  const missing = [...path.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((m) => m[1]);
  if (missing.length) {
    throw new Error(`Missing required path parameter(s): ${missing.join(", ")}`);
  }

  return {
    method: endpoint.method,
    path,
    query: Object.keys(query).length ? query : undefined,
    body: Object.keys(body).length ? body : undefined,
  };
}
