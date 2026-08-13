#!/bin/sh

set -eu

if /usr/bin/curl --fail --silent --show-error --max-time 8 \
  http://127.0.0.1:3310/api/healthz >/dev/null; then
  exit 0
fi

/usr/bin/systemctl restart filmbase-preview.service
