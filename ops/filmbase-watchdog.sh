#!/bin/sh

set -eu

memory_bytes=$(/usr/bin/systemctl show filmbase-preview.service \
  --property=MemoryCurrent --value)

# The service has a 512 MB hard ceiling. Recover before swap pressure makes
# page renders unusable, even if the lightweight health route still answers.
if [ "${memory_bytes:-0}" -ge 367001600 ]; then
  /usr/bin/systemctl restart filmbase-preview.service
  exit 0
fi

if /usr/bin/curl --fail --silent --show-error --max-time 8 \
  http://127.0.0.1:3310/ >/dev/null; then
  exit 0
fi

/usr/bin/systemctl restart filmbase-preview.service
