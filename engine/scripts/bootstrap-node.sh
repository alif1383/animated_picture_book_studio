#!/usr/bin/env sh
# ============================================================================
# Picture-Book Studio — Zero-Dependency Antigravity Node Bootstrapper (macOS/Linux)
# ============================================================================
# Ensures `agy-node` is available on PATH even on a fresh Antigravity install
# where neither system `node` nor `agy-node` has been created yet.
# Locates the Antigravity binary via $ANTIGRAVITY_AGENTAPI_EXE (or standard
# macOS/Linux install paths) and writes an executable `agy-node` shim
# (`ELECTRON_RUN_AS_NODE=1`) into `$ANTIGRAVITY_APP_DATA_DIR/bin` (which
# Antigravity always prepends to PATH).
#
# Usage:
#   sh "<plugin-root>/scripts/bootstrap-node.sh"
#   sh "<plugin-root>/scripts/bootstrap-node.sh" "<script.mjs>" [args...]
# ============================================================================

set -e

AGY_BIN=""

# 1. Resolve Antigravity binary from $ANTIGRAVITY_AGENTAPI_EXE
if [ -n "${ANTIGRAVITY_AGENTAPI_EXE:-}" ]; then
  BASE_DIR="$(dirname "$(dirname "$(dirname "$ANTIGRAVITY_AGENTAPI_EXE")")")"
  if [ -x "$BASE_DIR/Antigravity" ]; then
    AGY_BIN="$BASE_DIR/Antigravity"
  elif [ -x "$BASE_DIR/antigravity" ]; then
    AGY_BIN="$BASE_DIR/antigravity"
  elif [ -x "$BASE_DIR/MacOS/Antigravity" ]; then
    AGY_BIN="$BASE_DIR/MacOS/Antigravity"
  elif [ -x "$(dirname "$BASE_DIR")/MacOS/Antigravity" ]; then
    AGY_BIN="$(dirname "$BASE_DIR")/MacOS/Antigravity"
  fi
fi

# 2. Check standard macOS / Linux Antigravity installation paths
if [ -z "$AGY_BIN" ]; then
  for CANDIDATE in \
    "/Applications/Antigravity.app/Contents/MacOS/Antigravity" \
    "$HOME/Applications/Antigravity.app/Contents/MacOS/Antigravity" \
    "/opt/Antigravity/antigravity" \
    "/opt/antigravity/antigravity" \
    "/usr/bin/antigravity" \
    "/usr/local/bin/antigravity"; do
    if [ -x "$CANDIDATE" ]; then
      AGY_BIN="$CANDIDATE"
      break
    fi
  done
fi

# 3. Ensure `agy-node` shim exists in $ANTIGRAVITY_APP_DATA_DIR/bin (always on PATH in Antigravity)
SHIM_DIR="${ANTIGRAVITY_APP_DATA_DIR:-$HOME/.gemini/antigravity}/bin"
mkdir -p "$SHIM_DIR" 2>/dev/null || true

if [ -n "$AGY_BIN" ]; then
  if [ ! -x "$SHIM_DIR/agy-node" ]; then
    cat > "$SHIM_DIR/agy-node" <<EOF
#!/usr/bin/env sh
export ELECTRON_RUN_AS_NODE=1
exec "$AGY_BIN" "\$@"
EOF
    chmod +x "$SHIM_DIR/agy-node"
  fi
elif command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
  if [ ! -x "$SHIM_DIR/agy-node" ]; then
    cat > "$SHIM_DIR/agy-node" <<EOF
#!/usr/bin/env sh
exec "$NODE_BIN" "\$@"
EOF
    chmod +x "$SHIM_DIR/agy-node"
  fi
fi

# 4. If no arguments were passed, report status and exit
if [ "$#" -eq 0 ]; then
  if [ -n "$AGY_BIN" ]; then
    echo "[bootstrap-node] agy-node is ready (backed by $AGY_BIN)"
    exit 0
  elif command -v agy-node >/dev/null 2>&1; then
    echo "[bootstrap-node] agy-node is ready on PATH"
    exit 0
  elif command -v node >/dev/null 2>&1; then
    echo "[bootstrap-node] agy-node shim created (backed by system node)"
    exit 0
  else
    echo "[bootstrap-node] ERROR: Could not locate Antigravity or node binary" >&2
    exit 1
  fi
fi

# 5. Execute passed arguments with resolved runtime
if [ -n "$AGY_BIN" ]; then
  ELECTRON_RUN_AS_NODE=1 exec "$AGY_BIN" "$@"
elif command -v agy-node >/dev/null 2>&1; then
  exec agy-node "$@"
elif command -v node >/dev/null 2>&1; then
  exec node "$@"
else
  echo "[bootstrap-node] ERROR: Could not locate Antigravity or node binary" >&2
  exit 1
fi
