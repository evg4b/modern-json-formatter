import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import { configureChromeMock } from '@testing/storybook/chrome.mock';
import './faq';

const meta = {
  title: 'FAQ/Page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The in-extension jq help page: navigation sidebar and the manual with runnable examples.',
      },
    },
  },
  render: () => html`<mjf-faq-page></mjf-faq-page>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const SlowExamples: Story = {
  beforeEach: () => {
    configureChromeMock({ latency: 1500 });
  },
};
