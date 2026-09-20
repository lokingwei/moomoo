#!/usr/bin/env bash
# Re-mirror the moomoo API docs and regenerate src/catalog.ts from them.
#
#   ./tools/refresh.sh
#
# Review the diff on src/catalog.ts afterwards: it is the server's whole tool surface.
set -euo pipefail

cd "$(dirname "$0")/.."

DOCS_HOST="https://open.moomoo.com"
WORK="${TMPDIR:-/tmp}/moomoo-docs.$$"
UA="Mozilla/5.0 (compatible; moomoo-mcp-catalog)"

cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

mkdir -p "$WORK/docs"

# The docs are a VitePress site. llms.txt lists pages but some of its paths are
# stale, so take the route list from a rendered page's sidebar instead, which is
# always in sync with what is actually published.
echo "==> discovering routes"
curl -sfL "$DOCS_HOST/api/overview/getting-started" -H "User-Agent: $UA" > "$WORK/index.html"
grep -oE 'href="/(api|mcp-docs)/[a-z0-9/_-]+"' "$WORK/index.html" \
  | sed 's/href="//; s/"//' | sort -u > "$WORK/routes.txt"
echo "    $(wc -l < "$WORK/routes.txt" | tr -d ' ') routes"

# Every page is also served as raw markdown at <route>.md. Fetch with bounded
# parallelism: firing all ~110 at once gets some connections dropped, and a silently
# missing page means an endpoint silently disappears from the catalog.
echo "==> mirroring docs"
# Create the directory tree up front: concurrent `mkdir -p` on a shared parent can
# lose a race, and the fetch then writes into a directory that does not exist yet.
while read -r route; do
  mkdir -p "$WORK/docs/$(dirname "${route#/}.md")"
done < "$WORK/routes.txt"

fetch_one() {
  route="$1"
  curl -sfL --retry 3 --retry-delay 1 --retry-all-errors -m 30 \
    "$3${route}.md" -H "User-Agent: $4" -o "$2/docs/${route#/}.md"
}
export -f fetch_one
xargs -P 8 -I{} bash -c 'fetch_one "$@"' _ {} "$WORK" "$DOCS_HOST" "$UA" < "$WORK/routes.txt"

# Every route must have produced a real page, or the catalog would quietly shrink.
fail=0
while read -r route; do
  f="$WORK/docs/${route#/}.md"
  if [ ! -s "$f" ]; then
    echo "    ERROR: empty or missing: $route" >&2
    fail=1
  elif grep -q "404 - Page Not Found" "$f"; then
    echo "    ERROR: 404: $route" >&2
    fail=1
  fi
done < "$WORK/routes.txt"
[ "$fail" = "0" ] || { echo "==> aborting: docs mirror incomplete" >&2; exit 1; }
echo "    $(find "$WORK/docs" -name '*.md' -size +0 | wc -l | tr -d ' ') pages"

echo "==> extracting endpoints"
python3 tools/extract.py "$WORK/docs" tools/catalog.json

echo "==> generating src/catalog.ts"
python3 tools/gen_catalog.py tools/catalog.json src/catalog.ts

echo "==> done. Review: git diff src/catalog.ts"
