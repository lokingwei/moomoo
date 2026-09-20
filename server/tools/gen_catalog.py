#!/usr/bin/env python3
"""Turn catalog.json into the TypeScript endpoint catalog the Worker ships."""
import json
import pathlib
import re
import sys

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "catalog.json")
OUT = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "catalog.ts")

GROUP = {"quote": "quote", "trading": "trade", "sim-trade": "sim"}

# Doc leaf -> friendlier tool leaf.
RENAME = {
    "input-order": "place-order",
    "account-list": "accounts",
    "order-list": "open-orders",
    "history-order-list": "history-orders",
    "position-list": "positions",
    "cash-info": "funds",
    "max-buy-sell": "max-qty",
    "get-accounts": "accounts",
    "get-funds": "funds",
    "get-positions": "positions",
    "get-history-deals": "history-deals",
    "get-today-deals": "today-deals",
    "get-history-orders": "history-orders",
    "get-open-orders": "open-orders",
    "get-order-details": "order-detail",
    "get-max-qty": "max-qty",
    "top-brokers/top-brokers": "top-brokers",
    # Leaves that are meaningless without their section.
    "valuation/detail": "valuation-detail",
    "valuation/plate-stocks": "valuation-plate-stocks",
    "valuation/index-stocks": "valuation-index-stocks",
    "valuation/index-stock-plates": "valuation-index-stock-plates",
    "shareholders/overview": "shareholders-overview",
    "shareholders/institutional": "institutional-holders",
    "short/interest": "short-interest",
    "short/daily-volume": "short-daily-volume",
    "company/profile": "company-profile",
    "company/executives": "company-executives",
}


def snake(s: str) -> str:
    s = s.replace("-", "_").replace("/", "_")
    s = re.sub(r"[^A-Za-z0-9_]", "", s)
    return re.sub(r"_+", "_", s).strip("_").lower()


def tool_name(e, docs_seen):
    parts = e["doc"].split("/")          # api / <area> / ... / <leaf>
    area = parts[1]
    group = GROUP.get(area, snake(area))
    leaf = parts[-1]

    # One doc describing several endpoints: name from the URL instead.
    if docs_seen[e["doc"]] > 1:
        leaf = e["path"].rstrip("/").split("/")[-1]

    leaf = RENAME.get("/".join(parts[-2:]), RENAME.get(leaf, leaf))
    name = f"{group}_{snake(leaf)}"
    # Strip an accidental doubled group prefix (quote_quote_x).
    return re.sub(rf"^{group}_{group}_", f"{group}_", name)


def risk(e):
    """Classify what a tool can do, so the server can gate the dangerous ones."""
    p, m = e["path"], e["method"]
    if "/sim-trade/" in p:
        return "sim"
    if m in ("POST", "PUT", "DELETE") and "/accounts/" in p:
        return "live_trade"
    if "modify-user-security" in p:
        return "write"
    return "read"


def main():
    eps = json.loads(SRC.read_text())

    docs_seen = {}
    for e in eps:
        docs_seen[e["doc"]] = docs_seen.get(e["doc"], 0) + 1

    used = {}
    for e in eps:
        n = tool_name(e, docs_seen)
        if n in used:
            n = f"{n}_{snake(e['method'])}"
        used[n] = True
        e["tool"] = n
        e["risk"] = risk(e)

    dupes = [n for n, _ in used.items() if [x["tool"] for x in eps].count(n) > 1]
    assert not dupes, f"duplicate tool names: {dupes}"

    def items_of(p):
        """Element type for array params, read off the doc's raw type (`string[]`, `int[]`...)."""
        if p["type"] != "array":
            return ""
        raw = p.get("raw_type", "").lower()
        if "int" in raw or "long" in raw:
            t = "integer"
        elif "float" in raw or "double" in raw or "number" in raw:
            t = "number"
        elif "bool" in raw:
            t = "boolean"
        elif "string" in raw or "str" in raw:
            t = "string"
        else:
            # Arrays of documented structs (e.g. `[MultiLegInfo][]`) carry objects.
            t = "object" if re.search(r"[A-Z]", p.get("raw_type", "")) else "string"
        return ", items: %s" % json.dumps(t)

    def ts(e):
        params = ",\n".join(
            "      { name: %s, in: %s, type: %s%s, required: %s, description: %s }"
            % (
                json.dumps(p["name"]), json.dumps(p["in"]), json.dumps(p["type"]),
                items_of(p),
                "true" if p["required"] else "false", json.dumps(p["description"]),
            )
            for p in e["params"]
        )
        return (
            "  {\n"
            f"    tool: {json.dumps(e['tool'])},\n"
            f"    title: {json.dumps(e['title'])},\n"
            f"    method: {json.dumps(e['method'])},\n"
            f"    path: {json.dumps(e['path'])},\n"
            f"    risk: {json.dumps(e['risk'])},\n"
            f"    doc: {json.dumps(e['doc'])},\n"
            f"    description: {json.dumps(e['description'])},\n"
            f"    params: [\n{params}\n    ],\n"
            "  }"
        )

    body = ",\n".join(ts(e) for e in sorted(eps, key=lambda x: x["tool"]))
    OUT.write_text(
        "// GENERATED FILE - do not edit by hand.\n"
        "// Regenerate with: npm run build:catalog  (see server/tools/)\n"
        "// Source: https://open.moomoo.com/api (mirrored docs)\n\n"
        'import type { Endpoint } from "./types";\n\n'
        f"export const ENDPOINTS: Endpoint[] = [\n{body},\n];\n"
    )

    from collections import Counter
    print(f"tools: {len(eps)}")
    print("risk:", dict(Counter(e["risk"] for e in eps)))
    print("sample:", [e["tool"] for e in sorted(eps, key=lambda x: x['tool'])][:8])


main()
