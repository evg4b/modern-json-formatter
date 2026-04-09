import { join } from 'node:path';
import type { StorybookConfig } from 'storybook-web-components-rsbuild';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: 'storybook-web-components-rsbuild',
  rsbuildFinal: config => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias as Record<string, string>,
      '@core/browser': join(__dirname, 'browser.mock.ts'),
    };

    return config;
  },
};
export default config;
