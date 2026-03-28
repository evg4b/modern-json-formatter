import { defineConfig, type RsbuildMode } from '@rsbuild/core';
import { manifestGeneratorPlugin } from './plugins/rsbuild-v3-manifest-plugin';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginSass } from '@rsbuild/plugin-sass';
import { litMarkdown } from 'rsbuild-lit-markdown';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { lowerCase } from 'es-toolkit';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  mode: lowerCase(process.env.NODE_ENV ?? 'development') as RsbuildMode,
  source: { decorators: { version: 'legacy' } },
  plugins: [
    litMarkdown({ extensions: [gfmHeadingId({ prefix: 'mjf-' })] }),
    pluginSass(),
    pluginTypeCheck({ enable: true }),
    manifestGeneratorPlugin({
      baseManifest: {
        name: 'Modern JSON Formatter',
        key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAl7zH0Usx624mtBGBvMgEaAqBYmVwA6e/5MEPdGEwOjDG6ozNldorSPKRd/eaOzkwqvnnrHpYsHVhHA/9lp/oEJ0UEdoqJI9GhIeXnS5FTg6ZsmQEBa5exnT+goRRzGP6FkHJC5KP763bc6KtwfrQxtu4aVXbVK6BFDH3au1t3IEuESQaF87ZyguQYJaQx7WLL0aPXuJpmVT6cUWvryDXkwoTsDt/3bnmgzl9DFCHDMDlnpAlU+h90Vriof6yoeQlqve5Jk1y86k7HNyLLpdfT1ohkWGt19e+GGXT8xSD7+AaLU6sHdRdNX6ftStpBoSLtF1C9ScsC/WZuH28BJggRQIDAQAB',
        short_name: 'JSON fmt',
        minimum_chrome_version: '88',
        permissions: ['downloads', 'storage'],
        host_permissions: [
          '*://*/*',
          '<all_urls>',
        ],
        content_security_policy: {
          extension_pages: 'script-src \'self\' \'wasm-unsafe-eval\'; object-src \'self\';',
        },
      },
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
