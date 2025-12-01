/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["dist/**", ".report/**", "node_modules/**"],
  rules: {
    "at-rule-no-unknown": null,
    "import-notation": null,
  },
};
