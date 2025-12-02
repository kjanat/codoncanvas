#!/usr/bin/env bash
set -euo pipefail
_AUTH_JSON_REL_PATH=".local/share/opencode/auth.json"
# shellcheck disable=SC2088 # allow tilde as string
_AUTH_JSON_TILDE_PATH="~/${_AUTH_JSON_REL_PATH}"
AUTH_JSON_DEFAULT="${HOME}/${_AUTH_JSON_REL_PATH}"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Write Anthropic auth config to a JSON file.

Input (one required, in priority order):
  1. OPENCODE_JSON env var or stdin    Full JSON config
  2. Token triplet via env vars        CLAUDE_REFRESH_TOKEN, CLAUDE_ACCESS_TOKEN, CLAUDE_EXPIRY
  3. Token triplet via arguments       --refresh-token, --access-token, --expiry

Options:
  --refresh-token TOKEN   	   Refresh token [env: CLAUDE_REFRESH_TOKEN]
  --access-token TOKEN    	   Access token [env: CLAUDE_ACCESS_TOKEN]
  --expiry TIMESTAMP      	   Access token expiry [env: CLAUDE_EXPIRY]
  --json JSON             	   Full JSON config [env: OPENCODE_JSON]
  --path PATH             	   Output path [env: OPENCODE_AUTH_PATH] [default: ${OPENCODE_AUTH_PATH:-${_AUTH_JSON_TILDE_PATH}}]
  --mode [overwrite|merge|reject]  How to handle existing file [default: merge]
                                     - overwrite  Replace entirely
                                     - merge      Update only provided fields
                                     - reject     Fail if file exists
  --dry-run                        Preview without writing [default outside CI]
  --no-dry-run                     Write even in CI
  -h, --help                       Show this help

Examples:
  # set json config via env var
  OPENCODE_JSON='{"key":"..."}' $(basename "$0")

  # provide args instead of env vars
  $(basename "$0") --refresh-token abc --access-token xyz --expiry 1234567890

  # pipe json config from stdin
  cat config.json | $(basename "$0") --mode overwrite
EOF
}

log() {
  printf '%s\n' "$*" >&2
}

# Mask sensitive values in GitHub Actions logs
mask_value() {
  [[ -n "$1" ]] && echo "::add-mask::$1" || true
}

# Mask all values from a JSON object (recursively extracts string values)
mask_json_values() {
  local json="$1"
  if [[ -n "${json}" ]]; then
    # Mask the entire JSON string
    mask_value "${json}"
    # Also mask each individual string value in the JSON
    echo "${json}" | jq -r '.. | select(type == "string")' 2>/dev/null | while IFS= read -r val; do
      mask_value "${val}"
    done
  fi
}

require_cmd() {
  for c in "$@"; do
    if ! command -v "${c}" >/dev/null 2>&1; then
      log "Error: required command '${c}' not found in PATH"
      exit 1
    fi
  done
}

write_auth_json() {
  local path="$1"
  local refresh_token="$2"
  local access_token="$3"
  local expiry="$4"
  local mode="$5"    # overwrite | reject | merge
  local dry_run="$6" # true | false

  # Validate expiry is in the future
  local now_ms=$(($( date +%s) * 1000))
  if [[ "${expiry}" -le "${now_ms}" ]]; then
    log "Error: refusing to write expired token (expires: ${expiry})"
    return 1
  fi

  local new_auth
  new_auth=$(jq -n \
    --arg r "${refresh_token}" \
    --arg a "${access_token}" \
    --arg e "${expiry}" \
    '{type: "oauth", refresh: $r, access: $a, expires: $e}')

  if [[ "${dry_run}" == "true" || "${dry_run}" == "1" ]]; then
    local file_exists="no"
    [[ -f "${path}" ]] && file_exists="yes"
    {
      echo "=== DRY RUN ==="
      echo "Path: ${path}"
      echo "Mode: ${mode}"
      echo "File exists: ${file_exists}"
      [[ -f "${path}" ]] && echo "Current content:" && jq . "${path}"
      echo "New anthropic config:"
      echo "${new_auth}" | jq .
    } >&2
  fi

  local final_json
  case "${mode}" in
    reject | merge)
      if [[ -f "${path}" ]]; then
        if [[ "${mode}" == "reject" ]] && jq -e '.anthropic' "${path}" &>/dev/null; then
          log "Error: anthropic config already exists in ${path}"
          return 1
        fi
        final_json=$(jq --argjson auth "${new_auth}" '.anthropic = $auth' "${path}")
      else
        final_json=$(jq -n --argjson auth "${new_auth}" '{anthropic: $auth}')
      fi
      ;;
    overwrite)
      final_json=$(jq -n --argjson auth "${new_auth}" '{anthropic: $auth}')
      ;;
    *)
      log "Error: invalid mode '${mode}' (expected overwrite|merge|reject)"
      return 1
      ;;
  esac

  if [[ "${dry_run}" == "true" || "${dry_run}" == "1" ]]; then
    {
      echo "Would write:"
      echo "${final_json}" | jq .
      echo "=== END DRY RUN ==="
    } >&2
    return 0
  fi

  # write atomically with restrictive permissions
  printf '%s\n' "${final_json}" \
                                | install -D -m 600 /dev/stdin "${path}.tmp"
  mv "${path}.tmp" "${path}"
}

main() {
  require_cmd jq install

  local auth_path="${OPENCODE_AUTH_PATH:-${AUTH_JSON_DEFAULT}}"
  local mode="merge"
  local DRY_RUN="true"
  [[ "${CI:-}" == "1" || "${CI:-}" == "true" ]] && DRY_RUN="false"

  # primary inputs (see usage: JSON > env tokens > argument tokens)
  local JSON="${OPENCODE_JSON:-}"

  local REFRESH_TOKEN="${CLAUDE_REFRESH_TOKEN:-}"
  local ACCESS_TOKEN="${CLAUDE_ACCESS_TOKEN:-}"
  local EXPIRY="${CLAUDE_EXPIRY:-}"

  # Mask all sensitive env values immediately (for GitHub Actions logs)
  mask_value "${REFRESH_TOKEN}"
  mask_value "${ACCESS_TOKEN}"
  mask_value "${EXPIRY}"
  mask_json_values "${JSON}"

  local HAVE_ENV_TOKENS="false"
  if [[ -n "${REFRESH_TOKEN}" || -n "${ACCESS_TOKEN}" || -n "${EXPIRY}" ]]; then
    HAVE_ENV_TOKENS="true"
  fi

  # parse flags
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --path)
        auth_path="$2"
        shift 2
        ;;
      --mode)
        mode="$2"
        shift 2
        ;;
      --dry-run)
        DRY_RUN="true"
        shift
        ;;
      --no-dry-run)
        DRY_RUN="false"
        shift
        ;;
      --json)
        JSON="$2"
        mask_json_values "${JSON}"
        shift 2
        ;;
      --refresh-token)
        # only use CLI triplet if env vars are not present
        if [[ "${HAVE_ENV_TOKENS}" != "true" ]]; then
          REFRESH_TOKEN="$2"
          mask_value "${REFRESH_TOKEN}"
        fi
        shift 2
        ;;
      --access-token)
        if [[ "${HAVE_ENV_TOKENS}" != "true" ]]; then
          ACCESS_TOKEN="$2"
          mask_value "${ACCESS_TOKEN}"
        fi
        shift 2
        ;;
      --expiry)
        if [[ "${HAVE_ENV_TOKENS}" != "true" ]]; then
          EXPIRY="$2"
          mask_value "${EXPIRY}"
        fi
        shift 2
        ;;
      -h | --help)
        usage
        exit 0
        ;;
      --)
        shift
        break
        ;;
      -*)
        log "Unknown option: $1"
        usage
        exit 1
        ;;
      *)
        break
        ;;
    esac
  done

  # if JSON not provided via env/flag, but stdin is non-tty, read stdin
  if [[ -z "${JSON}" && ! -t 0 ]]; then
    JSON="$(cat)"
    mask_json_values "${JSON}"
  fi

  # allow positional override for token triplet only if both env + CLI are empty
  if [[ -z "${REFRESH_TOKEN}" && -z "${ACCESS_TOKEN}" && -z "${EXPIRY}" ]]; then
    if [[ $# -ge 1 ]]; then
                            REFRESH_TOKEN="$1"
                                                mask_value "${REFRESH_TOKEN}"
    fi
    if [[ $# -ge 2 ]]; then
                            ACCESS_TOKEN="$2"
                                               mask_value "${ACCESS_TOKEN}"
    fi
    if [[ $# -ge 3 ]]; then
                            EXPIRY="$3"
                                         mask_value "${EXPIRY}"
    fi
  fi

  if [[ -n "${JSON}" ]]; then
    # validate JSON first
    echo "${JSON}" | jq -e . >/dev/null

    # Validate expiry if present
    local json_expires
    json_expires=$(echo "${JSON}" | jq -r '.anthropic.expires // empty')
    if [[ -n "${json_expires}" ]]; then
      local now_ms=$(($( date +%s) * 1000))
      if [[ "${json_expires}" -le "${now_ms}" ]]; then
        log "Error: refusing to write expired token (expires: ${json_expires})"
        exit 1
      fi
    fi

    if [[ "${DRY_RUN}" == "true" ]]; then
      {
        echo "=== DRY RUN ==="
        echo "Would write JSON to: ${auth_path}"
        echo "${JSON}" | jq .
        echo "=== END DRY RUN ==="
      } >&2
    else
      printf '%s\n' "${JSON}" \
                              | install -D -m 600 /dev/stdin "${auth_path}.tmp"
      mv "${auth_path}.tmp" "${auth_path}"
    fi
  elif [[ -n "${REFRESH_TOKEN}" && -n "${ACCESS_TOKEN}" && -n "${EXPIRY}" ]]; then
    write_auth_json "${auth_path}" "${REFRESH_TOKEN}" "${ACCESS_TOKEN}" "${EXPIRY}" "${mode}" "${DRY_RUN}"
  else
    log "Error: Provide either valid JSON (env OPENCODE_JSON or stdin) or REFRESH_TOKEN, ACCESS_TOKEN, EXPIRY"
    usage
    exit 1
  fi
}

main "$@"
