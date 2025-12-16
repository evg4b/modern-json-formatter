import { defineConfig } from '@rsbuild/core';
import { manifestGeneratorPlugin } from "./rsbuild.manifest.plugin";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";
import { mdPlugin } from "./rsbuild.md.plugin";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  output: {
    distPath: {
      css: '',
      js: '',
    },
    filenameHash: false,
    sourceMap: true,
    copy: [
      { from: './worker-core/worker-core.wasm', to: '' },
      { from: './public/**/*', to: '' },
    ],
  },
  source: {
    define: { require: null },
    entry: {
      'content-styles': {
        import: './src/content-script/styles.css',
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
    mdPlugin({ test: true }),
    pluginNodePolyfill(),
    manifestGeneratorPlugin({
      manifestPath: './src/manifest.json',
    }),
  ],
  html: {
    template: (a) => `./src/${ a.entryName }/${ a.entryName }.html`,
  },
  tools: {
    rspack: {
      optimization: {
        splitChunks: false
      }
    }
  },
});
