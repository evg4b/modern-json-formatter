import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import './info-buton';

interface InfoButtonArgs {
  url: string;
}

const meta = {
  title: 'Content Script/InfoButton',
  component: 'mjf-info-button',
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
