module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ["eslint:recommended", "prettier"],
  env: {
    node: true,
    es6: true,
  },
  overrides: [
    {
      files: ["__mocks__/**/*.js", "*.test.js"],
      env: {
        jest: "true",
      },
      rules: {},
    },
    {
      files: ["public/**/*.js"],
      env: {
        browser: true,
        es6: true,
      },
      rules: {},
    },
  ],
};
