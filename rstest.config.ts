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
    exclude: [
      'testing/**/*',
      'worker-core/wasm_exec.js',
    ],
    include: [
      'src/**/*.ts',
      'worker-core/**/*.ts',
    ],
    reportOnFailure: true,
    reporters: ['text-summary', 'lcov', 'html'],
  },
  source: {
    decorators: {
      version: 'legacy',
    },
  },
});
