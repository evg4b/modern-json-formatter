import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '.git/',
      '.yarn/',
      'dist/',
      'jest.config.js',
      'media_data/',
      'packages/wasm_exec.js',
      'eslint.config.mjs',
      'coverage/',
      'tsup.config.mjs'
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
