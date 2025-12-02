#!/usr/bin/env bash
set -euo pipefail

AUTH_JSON_DEFAULT="${HOME}/.local/share/opencode/auth.json"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Check if auth.json token is expired.

Options:
  --path PATH   Auth file path [default: ~/.local/share/opencode/auth.json]
  --quiet       Suppress output on success
  -h, --help    Show this help

Exit codes:
  0  Token is valid
  1  Token is expired, missing, or file not found
EOF
}

log() { printf '%s\n' "$*" >&2; }

main() {
  local auth_path="${OPENCODE_AUTH_PATH:-${AUTH_JSON_DEFAULT}}"
  local quiet=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --path)
        auth_path="$2"
        shift 2
        ;;
      --quiet)
        quiet=true
        shift
        ;;
      -h | --help)
        usage
        exit 0
        ;;
      *)
        log "Unknown option: $1"
        usage
        exit 1
        ;;
    esac
  done

  if [[ ! -f "${auth_path}" ]]; then
    log "Error: auth file not found: ${auth_path}"
    exit 1
  fi

  # Validate JSON structure
  if ! jq -e . "${auth_path}" >/dev/null 2>&1; then
    log "Error: invalid JSON in ${auth_path}"
    exit 1
  fi

  local expires
  expires=$(jq -r '.anthropic.expires // empty' "${auth_path}")

  if [[ -z "${expires}" ]]; then
    log "Error: .anthropic.expires not found in ${auth_path}"
    exit 1
  fi

  local now_ms=$(($( date +%s) * 1000))

  if [[ "${expires}" -le "${now_ms}" ]]; then
    local expires_date
    expires_date=$(date -d "@$((expires / 1000))" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "unknown")
    log "Error: token expired"
    log "  Expires: ${expires} (${expires_date})"
    log "  Now:     ${now_ms}"
    exit 1
  fi

  if [[ "${quiet}" != "true" ]]; then
    local expires_date
    expires_date=$(date -d "@$((expires / 1000))" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "unknown")
    log "Token valid until: ${expires_date}"
  fi
}

main "$@"
