const OFF = 0
const ERROR = 2

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2015,
  },
  env: {
    browser: true,
    es6: true,
  },
  plugins: [
    'jest',
  ],
  extends: [
    'standard',
  ],
  rules: {
    'array-bracket-spacing': [ERROR, 'never'],
    'comma-dangle': [ERROR, 'always-multiline'],
    'no-console': [ERROR, { allow: ['warn', 'error'] }],
    'object-curly-spacing': [ERROR, 'always'],
    'quote-props': [ERROR, 'consistent-as-needed'],
    'standard/no-callback-literal': OFF,
  },
  overrides: [
    {
      files: ['*.test.js'],
      parserOptions: {
        ecmaVersion: 2017,
      },
      env: {
        'jest/globals': true,
      },
    },
    {
      files: ['scripts/*.js'],
      rules: {
        'no-console': OFF,
      },
    },
  ],
}
