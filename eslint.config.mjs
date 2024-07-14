import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      '.git/',
      'dist/',
      'jest.config.js',
      'media_data/',
      'tsup.config.js',
      'packages/wasm_exec.js'
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
);
