import { defineConfig } from '@rsbuild/core';
import { manifestGeneratorPlugin } from "./rsbuild.manifest.plugin";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  source: {
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
    },
    decorators: {
      version: 'legacy',
    },
  },
  plugins: [
    pluginNodePolyfill(),
    manifestGeneratorPlugin({
      manifestPath: './src/manifest.json'
    })
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
