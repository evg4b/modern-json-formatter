import type { StorybookConfig } from 'storybook-web-components-rsbuild';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-a11y'],
  framework: 'storybook-web-components-rsbuild',
  staticDirs: [{ from: '../assets/production', to: '/' }],
};
export default config;
