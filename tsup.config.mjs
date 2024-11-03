import copy from 'esbuild-plugin-copy';
import jsonMerge from 'esbuild-plugin-json-merge';
import { sassPlugin } from 'esbuild-sass-plugin';
import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';
import htmlPlugin from '@chialab/esbuild-plugin-html';

const packageJson = readFileSync('./package.json', 'utf8');
const { description, version } = JSON.parse(packageJson);
const production = process.env.NODE_ENV === 'production';

const assets = path =>
  copy({
    resolveFrom: 'cwd',
    assets: { from: [path], to: ['dist'] },
    watch: !production,
  });

export default defineConfig({
  entry: {
    'content-script': 'src/content-script/main.ts',
    faq: 'src/faq/faq.html',
  },
  splitting: false,
  sourcemap: !production,
  cjsInterop: true,
  target: 'es2020',
  tsconfig: 'tsconfig.ext.json',
  platform: 'browser',
  clean: true,
  bundle: true,
  treeshake: true,
  minify: production,
  minifyWhitespace: production,
  minifyIdentifiers: production,
  minifySyntax: production,
  noExternal: ['@webcomponents/custom-elements'],
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
    }),
    sassPlugin({
      type: 'css-text',
      style: 'compressed',
      syntax: 'scss',
      verbose: true,
      sourceMap: !production,
      sourceMapIncludeSources: !production,
      filter: /^.*\.module.scss$/,
    }),
    sassPlugin({
      type: 'css',
      style: 'compressed',
      syntax: 'scss',
      verbose: true,
      sourceMap: !production,
      sourceMapIncludeSources: !production,
    }),
    assets('packages/tokenizer/*.wasm'),
    assets('packages/jq/*.wasm'),
    assets('assets/*'),
    production ? assets('assets/production/*') : assets('assets/debug/*'),
  ],
});
