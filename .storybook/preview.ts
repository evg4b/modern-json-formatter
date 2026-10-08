import type { Preview } from 'storybook-web-components-rsbuild';
import { renderComponent, resetChromeMock } from '@testing/storybook';
import './preview.scss';

export default {
  render: renderComponent,
  argTypes: {
    // Slotted content: templates and nodes cannot be edited from the Controls panel.
    children: { control: false },
  },
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
