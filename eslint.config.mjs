import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '.git/',
      'dist/',
      'parser/',
      'jest.config.js',
      'media_data/',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
);
