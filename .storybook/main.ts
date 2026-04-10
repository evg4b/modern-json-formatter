import { join } from 'node:path';
import type { StorybookConfig } from 'storybook-web-components-rsbuild';

const root = join(import.meta.dirname, '..');

export default {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-a11y'],
  framework: 'storybook-web-components-rsbuild',
  staticDirs: [{ from: '../assets/production', to: '/' }],
  rsbuildFinal: config => {
    const filteredPlugins = (config.plugins ?? [])
      .filter(plugin => {
        return plugin && 'name' in plugin
          ? plugin.name != 'manifest-generator-plugin'
          : !!plugin;
      });

    config.plugins = filteredPlugins;
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
} satisfies StorybookConfig;
