import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'happy-dom',
  globals: true,
  logHeapUsage: true,
  include: [ 'src/**/button.test.ts' ],
  coverage: {
    enabled: true,
    exclude: ['testing/**/*'],
    reportOnFailure: true,
  },
  includeSource: [
    "./node_modules/lit/polyfill-support.js"
  ],
  source: {
    decorators: {
      version: 'legacy',
    }
  }
});