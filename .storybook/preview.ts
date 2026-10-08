import type { Preview } from 'storybook-web-components-rsbuild';
import { resetChromeMock } from '@testing/storybook/chrome.mock';
import './preview.scss';

export default {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  beforeEach: () => {
    resetChromeMock();
  },
} satisfies Preview;
