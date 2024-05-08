import jsonMerge from 'esbuild-plugin-json-merge';
import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';

const data = readFileSync('./package.json', 'utf8');
const { description, name, version } = JSON.parse(data);

export default defineConfig({
  entry: { index: 'src/index.ts' },
  splitting: false,
  sourcemap: true,
  cjsInterop: true,
  esbuildPlugins: [
    jsonMerge({
      entryPoints: ['src/manifest.json', { version, name, description }],
      outfile: 'manifest.json',
    }),
  ],
  clean: true,
});
