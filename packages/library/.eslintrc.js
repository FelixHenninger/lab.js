module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
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
    'template-curly-spacing': [0, 'always'],
    'linebreak-style': 0,
    // We dislike semicolons
    '@typescript-eslint/semi': 0,
    // We use underscores for internal methods
    'no-underscore-dangle': 0,
    // ts-migrate left us with lots of ts comments
    '@typescript-eslint/ban-ts-comment': 1,
    // ++ is fine
    'no-plusplus': 0,
    // Reducing classes is nice but not critical
    'max-classes-per-file': 0,
    // Named exports used often
    'import/prefer-default-export': 0,
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
