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

    // Storybook loads every .md file as raw text; ours are compiled to Lit templates by litMarkdown.
    const rspackTools = config.tools?.rspack;
    config.tools = {
      ...config.tools,
      rspack: [
        ...Array.isArray(rspackTools) ? rspackTools : [rspackTools ?? {}],
        rspackConfig => {
          for (const rule of rspackConfig.module?.rules ?? []) {
            if (rule && typeof rule === 'object' && rule.type === 'asset/source' && String(rule.test) === String(/\.md$/)) {
              rule.exclude = join(root, 'src');
            }
          }
        },
      ],
    };

    return config;
  },
} satisfies StorybookConfig;
