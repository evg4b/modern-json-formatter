import { defineConfig } from '@rsbuild/core';
import { manifestGeneratorPlugin } from './rsbuild.manifest.plugin';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginSass } from '@rsbuild/plugin-sass';
import { litMarkdown } from 'rsbuild-lit-markdown';
import { gfmHeadingId } from 'marked-gfm-heading-id';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  output: {
    distPath: { css: '', js: '' },
    filenameHash: false,
    sourceMap: true,
    copy: [
      { from: './worker-core/worker-core.wasm', to: '' },
      { from: '*', context: './assets/debug' },
      { from: '*', context: './assets' },
    ],
  },
  source: {
    define: { require: null },
    entry: {
      'content-script': {
        import: './src/content-script/main.ts',
        html: false,
      },
      'background': {
        import: './src/background/background.ts',
        html: false,
      },
      'options': {
        import: './src/options/options.ts',
        html: true,
      },
      'faq': {
        import: './src/faq/faq.ts',
        html: true,
      },
    },
    decorators: {
      version: 'legacy',
    },
  },
  plugins: [
    litMarkdown({
      extensions: [gfmHeadingId({ prefix: 'mjf-' })],
    }),
    pluginSass(),
    pluginTypeCheck({ enable: false }),
    pluginNodePolyfill(),
    manifestGeneratorPlugin({
      manifestPath: './src/manifest.json',
    }),
  ],
  html: {
    template: a => `./src/${a.entryName}/${a.entryName}.html`,
  },
  tools: {
    rspack: {
      optimization: {
        splitChunks: false,
      },
    },
  },
});
