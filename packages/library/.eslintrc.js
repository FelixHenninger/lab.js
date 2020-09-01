module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'key-spacing': [
      2,
      {
        mode: 'minimum',
      },
    ],
    'no-console': 0,
    'no-else-return': 1,
    'no-param-reassign': 1,
    'no-warning-comments': [
      'error',
      {
        terms: ['fixme', 'xxx'],
      },
    ],
    'prefer-rest-params': 1,
    radix: [2, 'as-needed'],
    'react/no-multi-comp': 0,
    'react/sort-comp': 0,
    semi: [2, 'never'],
    'space-before-function-paren': [2, 'never'],
    'space-infix-ops': 1,
    'template-curly-spacing': [2, 'always'],
    'linebreak-style': 0,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['**/*.{js,jsx}', '**/*.test.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
      },
    },
  ],
}
