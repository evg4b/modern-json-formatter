import { defineConfig } from '@rstest/core';
import { pluginSass } from '@rsbuild/plugin-sass';
import { mdPlugin } from './rsbuild.md.plugin';

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
  plugins: [
    pluginSass(),
    mdPlugin(),
  ],
  source: {
    decorators: {
      version: 'legacy',
    },
  },
});
