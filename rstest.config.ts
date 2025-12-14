import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'happy-dom',
  globals: true,
  logHeapUsage: true,
  include: [
    'src/**/button/**/*.test.ts',
    'worker-core/**/*.test.ts',
  ],
  coverage: {
    enabled: true,
    exclude: ['testing/**/*'],
    reportOnFailure: true,
  },
  source: {
    decorators: {
      version: 'legacy',
    }
  }
});