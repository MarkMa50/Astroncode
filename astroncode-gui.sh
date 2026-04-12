#!/bin/sh
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
PORT="${ASTRONCODE_GUI_PORT:-46321}"
HOST="${ASTRONCODE_GUI_HOST:-127.0.0.1}"
URL="http://${HOST}:${PORT}"

check_ready() {
  curl -fsS "${URL}/api/status" >/dev/null 2>&1
}

open_browser() {
  if command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 || true
  fi
}

if check_ready; then
  open_browser
  exit 0
fi

export LANG="en_US.UTF-8"
export PYTHONIOENCODING="utf-8"
export NODE_OPTIONS="--no-warnings"
node "$SCRIPT_DIR/scripts/start.mjs" gui --port "$PORT" --host "$HOST" --no-browser >/tmp/astroncode-gui.log 2>&1 &

attempt=0
while [ "$attempt" -lt 40 ]; do
  sleep 0.5
  if check_ready; then
    open_browser
    exit 0
  fi
  attempt=$((attempt + 1))
done

echo "Astroncode GUI did not start successfully. Please verify Node and your local config, then try again." >&2
exit 1
