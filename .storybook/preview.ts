import type { Preview } from 'storybook-web-components-rsbuild';
import { renderComponent, resetChromeMock } from '@testing/storybook';
import './preview.scss';

export default {
  render: renderComponent,
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
