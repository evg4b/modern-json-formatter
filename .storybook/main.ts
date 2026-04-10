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
  staticDirs: [{ from: '../assets/production', to: '/' }],
  rsbuildFinal: config => {
    const browserMock = join(__dirname, 'browser.mock.ts');
    const browserSrc = join(__dirname, '../src/core/browser');

    const backgroundMock = join(__dirname, 'background.mock.ts');
    const backgroundSrc = join(__dirname, '../src/core/background');

    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias as Record<string, string>,
      '@core/browser': browserMock,
      [browserSrc]: browserMock,
      [`${browserSrc}/index.ts`]: browserMock,
      '@core/background': backgroundMock,
      [backgroundSrc]: backgroundMock,
      [`${backgroundSrc}/index.ts`]: backgroundMock,
    };

    return config;
  },
};
export default config;
