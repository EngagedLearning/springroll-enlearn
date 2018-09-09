const OFF = 0;
const ERROR = 2;

module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2015,
  },
  env: {
    browser: true,
    es6: true,
  },
  plugins: ["jest", "promise"],
  extends: [
    "prettier",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:promise/recommended",
    "plugin:jest/recommended",
  ],
  rules: {
    "no-console": [ERROR, { allow: ["warn", "error"] }],
  },
  overrides: [
    {
      files: ["*.test.js"],
      parserOptions: {
        ecmaVersion: 2017,
      },
      env: {
        "jest/globals": true,
      },
    },
    {
      files: ["scripts/*.js"],
      parserOptions: {
        sourceType: "script",
      },
      rules: {
        "no-console": OFF,
      },
    },
  ],
};
