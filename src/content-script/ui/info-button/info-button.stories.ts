import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './info-buton';

interface InfoButtonArgs {
  url: string;
}

const meta = {
  title: 'Content Script/InfoButton',
  render: ({ url }) => html`<mjf-info-button url=${url}></mjf-info-button>`,
  args: {
    url: 'faq.html',
  },
} satisfies Meta<InfoButtonArgs>;

export default meta;
type Story = StoryObj<InfoButtonArgs>;

export const Default: Story = {};

export const ExternalLink: Story = {
  args: { url: 'https://jqlang.org/manual/' },
};
