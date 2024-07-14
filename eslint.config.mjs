import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '.git/',
      'dist/',
      'tokenizer/',
      'jest.config.js',
      'media_data/',
      'tsup.config.js',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
);
