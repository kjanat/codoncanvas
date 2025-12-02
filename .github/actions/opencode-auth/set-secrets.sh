#!/usr/bin/env bash
set -euo pipefail

# Upload opencode auth.json to GitHub repository secrets/variables
# Called from lefthook pre-push hook

AUTH_JSON_PATH="${HOME}/.local/share/opencode/auth.json"

log() { printf '%s\n' "$*" >&2; }

main() {
  # Early exit if auth.json doesn't exist
  if [[ ! -f "${AUTH_JSON_PATH}" ]]; then
    log "Skipping: ${AUTH_JSON_PATH} not found"
    exit 0
  fi

  # Validate token not expired
  if ! .github/actions/opencode-auth/check-expiry.sh --quiet; then
    log "Skipping: token expired"
    exit 0
  fi

  # Get repo info
  local gh_info gh_active gh_owner gh_repo
  gh_info="$(gh repo view --json nameWithOwner,owner)"
  gh_active="$(gh auth status --active --json hosts --jq '.hosts."github.com"[].login')"
  gh_owner="$(jq -r '.owner.login' <<<"${gh_info}")"
  gh_repo="$(jq -r '.nameWithOwner' <<<"${gh_info}")"

  # Only update if authenticated as repo owner
  if [[ "${gh_active}" != "${gh_owner}" ]]; then
    log "Skipping: authenticated as '${gh_active}', not repo owner '${gh_owner}'"
    exit 0
  fi

  log "Updating secrets for ${gh_repo}..."

  # Set the secret
  gh secret set OPENCODE_JSON --repo "${gh_repo}" <"${AUTH_JSON_PATH}"

  # Set expiry as variable for visibility (not sensitive)
  local expiry
  expiry="$(jq -r '.anthropic.expires // empty' "${AUTH_JSON_PATH}")"
  if [[ -n "${expiry}" ]]; then
    gh variable set OPENCODE_EXPIRY --repo "${gh_repo}" --body "${expiry}"
    local expiry_date
    expiry_date=$(date -d "@$((expiry / 1000))" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "unknown")
    log "Token expires: ${expiry_date}"
  fi

  log "Done"
}

main "$@"
