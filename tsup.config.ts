import copy from 'esbuild-plugin-copy';
import jsonMerge from 'esbuild-plugin-json-merge';
import { sassPlugin } from 'esbuild-sass-plugin';
import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';

const data = readFileSync('./package.json', 'utf8');
const { description, version } = JSON.parse(data);
const production = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: { index: 'src/index.ts' },
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
    sassPlugin({ type: 'css-text' }),
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['parser/parser.wasm'],
        to: ['dist/parser.wasm'],
      },
      // watch: true,
    }),
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['assets/**/*'],
        to: ['dist'],
      },
      // watch: true,
    }),
  ],
});
