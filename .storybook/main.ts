import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import type { StorybookConfig } from 'storybook-web-components-rsbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-a11y'],
  framework: 'storybook-web-components-rsbuild',
  rsbuildFinal: config => {
    const browserMock = join(__dirname, 'browser.mock.ts');
    const browserSrc = join(__dirname, '../src/core/browser');

    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias as Record<string, string>,
      // alias both the tsconfig path alias key and the resolved file path
      '@core/browser': browserMock,
      [browserSrc]: browserMock,
      [`${browserSrc}/index.ts`]: browserMock,
    };

    return config;
  },
};
export default config;
