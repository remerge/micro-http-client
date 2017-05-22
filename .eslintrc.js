module.exports = {
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    jest: true,
  },
  globals: {
    fetch: true,
  },
  rules: {
    'max-len': 0,
    'require-jsdoc': 0,
  },
};
