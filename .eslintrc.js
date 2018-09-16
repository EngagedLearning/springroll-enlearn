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
  plugins: ["jest"],
  extends: ["@enlearn", "plugin:jest/recommended"],
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
        "no-console": "off",
      },
    },
  ],
};
