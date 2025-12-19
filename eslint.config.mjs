import js from '@eslint/js';
import globals from 'globals';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default [
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...ts.configs.recommended,
  stylistic.configs['recommended'],
  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
    },
  },
  {
    ignores: [
      'dist/',
      'worker-core/wasm_exec.js',
      'tsup.config.mjs',
    ],
  },
];
