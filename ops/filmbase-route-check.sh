#!/bin/sh

set -eu

BASE_URL="${FILMBASE_CHECK_URL:-https://filmbase.fun}"
MAX_TIME="${FILMBASE_CHECK_MAX_TIME:-15}"

check() {
  path="$1"
  code=$(/usr/bin/curl --fail --silent --show-error --max-time "$MAX_TIME" -o /dev/null -w '%{http_code}' "$BASE_URL$path")
  [ "$code" = "200" ] || { echo "FilmBase route failed: $path ($code)" >&2; exit 1; }
}

check "/api/healthz"
check "/"
check "/discover"
check "/anime"
check "/help"
check "/robots.txt"
check "/sitemap.xml"

echo "FilmBase route check passed"
