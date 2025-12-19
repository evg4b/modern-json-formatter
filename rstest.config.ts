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
    enabled: true,
    exclude: ['testing/**/*'],
    reportOnFailure: true,
    reporters: ['text', 'lcov'],
  },
  source: {
    decorators: {
      version: 'legacy',
    },
  },
});
