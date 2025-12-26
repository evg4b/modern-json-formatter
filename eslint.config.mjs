import js from '@eslint/js';
import globals from 'globals';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import { configs as lit } from 'eslint-plugin-lit';
import { configs } from 'eslint-plugin-wc';

export default [
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  stylistic.configs['all'],
  lit['flat/all'],
  configs['flat/recommended'],
  configs['flat/best-practice'],
  ...ts.configs.recommended,
  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/padded-blocks': 'off',
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/quote-props': ['error', 'consistent-as-needed'],
      '@stylistic/object-curly-spacing': [
        'error',
        'never',
        {
          overrides: {
            ObjectExpression: 'always',
            ImportDeclaration: 'always',
            ImportAttributes: 'always',
            ExportNamedDeclaration: 'always',
            ExportAllDeclaration: 'always',
            TSInterfaceBody: 'always',
            TSEnumBody: 'always',
            TSTypeLiteral: 'always',
            ObjectPattern: 'always',
          },
        },
      ],
      '@stylistic/lines-between-class-members': ['off', 'never'],
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
          catch: 'always',
        },
      ],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/array-element-newline': ['error', { multiline: true, consistent: true, minItems: 10 }],
      '@stylistic/operator-linebreak': ['error', 'before'],
      '@stylistic/wrap-regex': 'off',
      '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@typescript-eslint/implicit-arrow-linebreak': 'off',
    },
  },
  {
    ignores: [
      'dist/',
      'worker-core/wasm_exec.js',
    ],
  },
];
