#!/usr/bin/env bash

set +e
bun lint:duplicates
exit_code=$?

if [[ -f ./.report/jscpd-report.md ]]; then
  # shellcheck disable=SC2154
  cat ./.report/jscpd-report.md >>"${GITHUB_STEP_SUMMARY}"
fi

exit "${exit_code}"
