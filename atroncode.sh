#!/bin/sh
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
export LANG="en_US.UTF-8"
export PYTHONIOENCODING="utf-8"
export NODE_OPTIONS="--no-warnings"
node "$SCRIPT_DIR/scripts/start.mjs" "$@"
