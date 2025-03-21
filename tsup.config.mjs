import copy from 'esbuild-plugin-copy';
import jsonMerge from 'esbuild-plugin-json-merge';
import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import { resolve } from "node:path";
import lodashTransformer from 'esbuild-plugin-lodash';

const production = process.env.NODE_ENV === 'production';

const packageJson = readFileSync('./package.json', 'utf8');
const { description, version } = JSON.parse(packageJson);

const assets = (path, to) =>
  copy({
    resolveFrom: 'cwd',
    assets: { from: [path], to: [resolve('dist', to ?? '')] },
    watch: !production,
  });

export default defineConfig((base) => ({
  ...base,
  entry: {
    'content-script': 'src/content-script/main.ts',
    'content-styles': 'src/content-script/styles.css',
    faq: 'src/faq/faq.html',
    background: 'src/background/background.ts',
    options: 'src/options/options.html',
  },
  splitting: false,
  sourcemap: !production,
  cjsInterop: true,
  target: 'es2022',
  tsconfig: 'tsconfig.ext.json',
  platform: 'browser',
  clean: true,
  bundle: true,
  treeshake: false,
  minify: production,
  minifyWhitespace: production,
  minifyIdentifiers: production,
  minifySyntax: production,
  noExternal: ['@webcomponents/custom-elements', 'lodash'],
  external: ['chrome-extension://__MSG_@@extension_id__/Monaco.woff'],
  metafile: !production,
  loader: {
    '.svg': 'text',
  },
  esbuildPlugins: [
    htmlPlugin({
      modulesTarget: 'es2020',
    }),
    jsonMerge({
      entryPoints: ['src/manifest.json', { version, description }],
      outfile: 'manifest.json',
      watch: !production,
    }),
    assets('worker-core/worker-core.wasm', 'worker-core.wasm'),
    assets('assets/*'),
    production
      ? assets('assets/production/*')
      : assets('assets/debug/*'),
    lodashTransformer({
      filter: /\.(js|mjs|ts|tsx|mts)$/,
    }),
  ],
}));
