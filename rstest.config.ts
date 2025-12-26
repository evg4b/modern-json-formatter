import { defineConfig } from '@rstest/core';
import { pluginSass } from '@rsbuild/plugin-sass';
import { litMarkdown } from 'rsbuild-lit-markdown';
import { gfmHeadingId } from 'marked-gfm-heading-id';

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
    litMarkdown({
      extensions: [gfmHeadingId({ prefix: 'mjf-' })],
    }),
  ],
  source: {
    decorators: {
      version: 'legacy',
    },
  },
});
