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
    distPath: { css: '', js: '', wasm: '' },
    filenameHash: false,
    sourceMap: true,
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
    pluginTypeCheck({ enable: true }),
    pluginNodePolyfill(),
    manifestGeneratorPlugin({
      manifestPath: './src/manifest.json',
      development: process.env.NODE_ENV !== 'production',
      assets: [
        { from: '*', context: './assets/production', type: 'production' },
        { from: '*', context: './assets/debug', type: 'development' },
        { from: '*', context: './assets' },
      ],
    }),
  ],
  html: {
    template: ({ entryName }) => `./src/${entryName}/${entryName}.html`,
  },
  tools: {
    rspack: {
      optimization: {
        splitChunks: false,
      },
    },
  },
});
