import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'happy-dom',
  globals: true,
  logHeapUsage: true,
  include: [
    'worker-core/**/*.test.ts',
    'src/**/*.test.ts',
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