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
    "eslint:recommended",
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
      files: ["rollup.config.js"],
      env: {
        browser: false,
        node: true,
      },
    },
    {
      files: [
        ".eslintrc.js",
        "jest.config.js",
        "prettier.config.js",
        "scripts/*.js",
      ],
      parserOptions: {
        sourceType: "script",
      },
      env: {
        browser: false,
        node: true,
      },
      rules: {
        "no-console": OFF,
      },
    },
  ],
};
