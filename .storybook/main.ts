import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { StorybookConfig } from 'storybook-web-components-rsbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-a11y'],
  framework: 'storybook-web-components-rsbuild',
  staticDirs: [{ from: '../assets/production', to: '/' }],
  rsbuildFinal: config => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias as Record<string, string>,
      '@core': join(root, 'src/core'),
      '@testing': join(root, 'testing'),
      '@wasm': join(root, 'worker-wasm/pkg'),
      '@wasm/types': join(root, 'worker-wasm/types'),
    };

    return config;
  },
};
export default config;
