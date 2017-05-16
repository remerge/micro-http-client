module.exports = {
  extends: 'google',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    jest: true,
  },
  rules: {
    'max-len': 0,
    'require-jsdoc': 0,
  },
};
