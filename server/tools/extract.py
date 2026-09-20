#!/usr/bin/env python3
"""Parse the mirrored moomoo OpenAPI docs into a machine-readable endpoint catalog."""
import json
import pathlib
import re
import sys

DOCS = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "docs2")
OUT = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "catalog.json")

BADGE = re.compile(
    r'<Badge[^>]*text="(GET|POST|PUT|DELETE|PATCH)"[^>]*/>\s*`([^`]+)`'
)
FRONT = re.compile(r"^---\n(.*?)\n---\n", re.S)
HEAD = re.compile(r"^(#{2,4}) +(.*?)\s*$", re.M)

PARAM_SECTIONS = {
    "parameters",
    "request parameters",
    "path parameters",
    "query parameters",
    "body parameters",
}


def strip_md(s: str) -> str:
    """Flatten markdown inline syntax into plain prose."""
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)      # links
    s = re.sub(r"<Badge[^>]*/>", "", s)
    s = re.sub(r"<br\s*/?>", " ", s)
    s = s.replace("`", "").replace("**", "").replace("*", "")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def split_row(line: str):
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]


def parse_tables(block: str):
    """Yield (headers, rows) for every markdown table in a block."""
    lines = block.split("\n")
    i = 0
    while i < len(lines):
        if lines[i].strip().startswith("|") and i + 1 < len(lines):
            sep = lines[i + 1].strip()
            if re.fullmatch(r"\|[\s:|-]+\|?", sep) and "-" in sep:
                headers = [h.lower() for h in split_row(lines[i])]
                rows = []
                j = i + 2
                while j < len(lines) and lines[j].strip().startswith("|"):
                    rows.append(split_row(lines[j]))
                    j += 1
                yield headers, rows
                i = j
                continue
        i += 1


def sections(text: str):
    """Split a block into (heading, body) pairs for any heading level."""
    out, marks = [], list(HEAD.finditer(text))
    for n, m in enumerate(marks):
        end = marks[n + 1].start() if n + 1 < len(marks) else len(text)
        out.append((m.group(2).strip().lower(), text[m.end():end]))
    return out


def col(headers, *names):
    for n in names:
        if n in headers:
            return headers.index(n)
    return None


def infer_type(raw: str) -> str:
    t = raw.lower()
    if "[]" in t or "array" in t or "list" in t:
        return "array"
    if "int" in t or "long" in t:
        return "integer"
    if "float" in t or "double" in t or "number" in t or "decimal" in t:
        return "number"
    if "bool" in t:
        return "boolean"
    if "object" in t or t.startswith("["):
        return "object"
    return "string"


def infer_in(raw: str, pname: str, path: str, method: str) -> str:
    loc = raw.lower()
    if "path" in loc:
        return "path"
    if "query" in loc:
        return "query"
    if "body" in loc:
        return "body"
    if "header" in loc:
        return "header"
    if "{%s}" % pname in path:
        return "path"
    return "body" if method in ("POST", "PUT", "PATCH") else "query"


def main():
    endpoints = []
    for f in sorted(DOCS.rglob("*.md")):
        text = f.read_text(encoding="utf-8", errors="replace")
        badges = list(BADGE.finditer(text))
        if not badges:
            continue

        for bi, m in enumerate(badges):
            # Each endpoint owns the text from its badge to the next badge.
            scope_end = badges[bi + 1].start() if bi + 1 < len(badges) else len(text)
            scope = text[m.end():scope_end]
            endpoints.append(parse_endpoint(f, text, m, scope, multi=len(badges) > 1))
        continue
    finish(endpoints)


def parse_endpoint(f, text, m, scope, multi):
        method, raw_path = m.group(1), m.group(2).strip()

        # Some docs append a sample query string to the path; keep the path only.
        path = raw_path.split("?", 1)[0]
        inline_query = raw_path.split("?", 1)[1] if "?" in raw_path else ""

        title = ""
        if multi:
            # Multi-endpoint doc: the nearest heading above the badge names this endpoint.
            heads = [h for h in HEAD.finditer(text) if h.start() < m.start()]
            if heads:
                title = re.sub(r"\s*\(.*?\)\s*$", "", heads[-1].group(2).strip())
        if not title:
            fm = FRONT.match(text)
            if fm:
                tm = re.search(r"^title:\s*(.*)$", fm.group(1), re.M)
                if tm:
                    title = tm.group(1).strip().strip("\"'")
        if not title:
            h1 = re.search(r"^# +(.*)$", text, re.M)
            title = h1.group(1).strip() if h1 else f.stem

        # Description: first prose paragraph after the badge line.
        desc = ""
        for para in scope.split("\n\n"):
            p = strip_md(para)
            if p and not p.startswith("#") and not p.startswith("|") and not p.startswith(":::"):
                desc = p
                break

        params, seen = [], set()
        for hname, body in sections(scope):
            if hname not in PARAM_SECTIONS:
                continue
            for headers, rows in parse_tables(body):
                ci = col(headers, "name", "parameter", "field")
                if ci is None:
                    continue
                ti = col(headers, "type")
                li = col(headers, "in", "position", "location")
                ri = col(headers, "required")
                di = col(headers, "description")
                for r in rows:
                    if ci >= len(r):
                        continue
                    pname = strip_md(r[ci])
                    # Nested/child rows use dotted or indented names; keep top level only.
                    if not pname or "." in pname or pname.startswith("-"):
                        continue
                    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", pname):
                        continue
                    if pname in seen:
                        continue
                    seen.add(pname)
                    rawtype = strip_md(r[ti]) if ti is not None and ti < len(r) else "string"
                    rawreq = strip_md(r[ri]).lower() if ri is not None and ri < len(r) else ""
                    rawloc = strip_md(r[li]) if li is not None and li < len(r) else ""
                    if hname == "path parameters":
                        rawloc = "path"
                    params.append({
                        "name": pname,
                        "type": infer_type(rawtype),
                        "raw_type": rawtype,
                        "in": infer_in(rawloc, pname, path, method),
                        "required": rawreq.startswith("y") or rawreq == "true",
                        "description": strip_md(r[di]) if di is not None and di < len(r) else "",
                    })

        # Path placeholders must always exist as params.
        for ph in re.findall(r"\{([A-Za-z_][A-Za-z0-9_]*)\}", path):
            if ph not in seen:
                seen.add(ph)
                params.append({
                    "name": ph, "type": "string", "raw_type": "string", "in": "path",
                    "required": True, "description": f"Path parameter {ph}.",
                })
            else:
                for p in params:
                    if p["name"] == ph:
                        p["in"] = "path"
                        p["required"] = True
        # Placeholders that only appear in the doc's sample query string are query params.
        for ph in re.findall(r"\{([A-Za-z_][A-Za-z0-9_]*)\}", inline_query):
            for p in params:
                if p["name"] == ph and p["in"] == "path":
                    p["in"] = "query"

        return {
            "doc": str(f.relative_to(DOCS)).replace(".md", ""),
            "title": title,
            "method": method,
            "path": path,
            "description": desc,
            "params": params,
        }


def finish(endpoints):
    endpoints.sort(key=lambda e: (e["path"], e["method"]))
    OUT.write_text(json.dumps(endpoints, indent=2, ensure_ascii=False))
    print(f"endpoints: {len(endpoints)}")
    print(f"params:    {sum(len(e['params']) for e in endpoints)}")
    noparam = [e["doc"] for e in endpoints if not e["params"]]
    print(f"no params: {len(noparam)} {noparam[:6]}")
    nodesc = [e["doc"] for e in endpoints if not e["description"]]
    print(f"no desc:   {len(nodesc)} {nodesc[:6]}")


main()
