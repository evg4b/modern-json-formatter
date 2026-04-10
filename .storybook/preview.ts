import type { Preview } from 'storybook-web-components-rsbuild';
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
} satisfies Preview;
