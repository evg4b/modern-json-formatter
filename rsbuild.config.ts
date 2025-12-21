import { defineConfig } from '@rsbuild/core';
import { manifestGeneratorPlugin } from './rsbuild.manifest.plugin';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { mdPlugin } from './rsbuild.md.plugin';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginSass } from '@rsbuild/plugin-sass';

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
      'content-styles': {
        import: './src/content-script/styles.scss',
        html: false,
      },
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
    mdPlugin(),
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
