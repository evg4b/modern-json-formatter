import { defineConfig } from '@rsbuild/core';
import { manifestGeneratorPlugin } from './plugins/rsbuild-v3-manifest-plugin';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginSass } from '@rsbuild/plugin-sass';
import { litMarkdown } from 'rsbuild-lit-markdown';
import { gfmHeadingId } from 'marked-gfm-heading-id';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    litMarkdown({
      extensions: [gfmHeadingId({ prefix: 'mjf-' })],
    }),
    pluginSass(),
    pluginTypeCheck({ enable: true }),
    pluginNodePolyfill(),
    manifestGeneratorPlugin({
      manifestPath: './src/manifest.json',
      background: './src/background/background.ts',
      contentScripts: './src/content-script/main.ts',
      options: './src/options/options.ts',
      pages: {
        faq: './src/faq/faq.ts',
      },
      assets: [
        { from: '*', context: './assets/production', type: 'production' },
        { from: '*', context: './assets/debug', type: 'development' },
        { from: '*', context: './assets' },
      ],
    }),
  ],
  tools: {
    rspack: {
      optimization: {
        splitChunks: false,
      },
    },
  },
});
