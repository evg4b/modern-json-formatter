import copy from 'esbuild-plugin-copy';
import jsonMerge from 'esbuild-plugin-json-merge';
import { sassPlugin } from 'esbuild-sass-plugin';
import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';

const packageJson = readFileSync('./package.json', 'utf8');
const { description, version } = JSON.parse(packageJson);
const production = process.env.NODE_ENV === 'production';

const assets = (path: string) => copy({
  resolveFrom: 'cwd',
  assets: { from: [path], to: ['dist'] },
  watch: !production,
});

export default defineConfig({
  entry: { main: 'src/main.ts' },
  splitting: false,
  sourcemap: !production,
  cjsInterop: true,
  target: 'es2020',
  clean: true,
  bundle: true,
  treeshake: true,
  minify: production,
  minifyWhitespace: production,
  minifyIdentifiers: production,
  minifySyntax: production,
  esbuildPlugins: [
    jsonMerge({
      entryPoints: ['src/manifest.json', { version, description }],
      outfile: 'manifest.json',
    }),
    sassPlugin({
      type: 'css-text',
      style: 'compressed',
      verbose: true,
      sourceMap: !production,
      sourceMapIncludeSources: !production,
    }),
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['parser/parser.wasm'],
        to: ['dist/parser.wasm'],
      },
      watch: !production,
    }),
    assets('assets/*'),
    production ? assets('assets/production/*') : assets('assets/debug/*'),
  ],
});
