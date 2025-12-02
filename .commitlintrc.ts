import { RuleConfigSeverity, type UserConfig } from "@commitlint/types";

/** Commitlint config
 *
 * @see: [@commitlint/config-conventional/lib/index.js](./node_modules/@commitlint/config-conventional/lib/index.js)
 */
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "build",
        "chore",
        "ci",
        "core",
        "docs",
        "feat",
        "fix",
        "ignore",
        "perf",
        "refactor",
        "revert",
        "site",
        "style",
        "test",
        "wip",
      ],
    ],
  },
};

export default config;
