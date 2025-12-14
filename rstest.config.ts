import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'happy-dom',
  globals: true,
  logHeapUsage: true,
  include: [
    'src/**/button/**/*.test.ts',
    'worker-core/**/*.test.ts',
    'src/background/**/*.test.ts',
    'src/core/**/*.test.ts',
  ],
  coverage: {
    enabled: false,
    exclude: ['testing/**/*'],
    reportOnFailure: true,
  },
  source: {
    decorators: {
      version: 'legacy',
    }
  }
});