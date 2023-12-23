// eslint-disable-next-line no-undef
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:homey-app/recommended', 'plugin:import/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    quotes: ['error', 'single', {
      'avoidEscape': true
    }],
    curly: 'error',
    indent: ['error', 2],
    semi: ['error', 'always'],
    'object-curly-newline': ['error', {
      'ImportDeclaration':{
        'minProperties': 4
      },
      'ExportDeclaration': {
        'minProperties': 4
      }
    }],
    'array-element-newline': ['error', 'consistent'],
    'brace-style': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'object-curly-spacing': ['error', 'never'],
  },
  // TODO Separate config for React in telegram-settings
  ignorePatterns: ['telegram-settings/**/*.*'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
      }
    }
  },
};