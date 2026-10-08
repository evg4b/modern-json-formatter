import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { createSidebarContextHost } from '@testing/storybook/sidebar-context';
import '@testing/storybook/chrome.mock';
import './content';

const meta = {
  title: 'FAQ/Content',
  parameters: {
    docs: {
      description: {
        component: 'All chapters of the jq manual in reading order, as shown to the right of the FAQ sidebar.',
      },
    },
  },
  render: () => createSidebarContextHost(document.createElement('mjf-content')),
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};
