import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './logo';
import type { LogoSize } from './logo';

interface LogoArgs {
  size: LogoSize;
  alt: string;
}

const meta = {
  title: 'Core/Logo',
  render: ({ size, alt }) => html`<mjf-logo size=${size} alt=${alt}></mjf-logo>`,
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['32', '48', '128', '256', '512'] satisfies LogoSize[],
    },
  },
  args: {
    size: '128',
    alt: 'Modern JSON Formatter',
  },
} satisfies Meta<LogoArgs>;

export default meta;
type Story = StoryObj<LogoArgs>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: '32' },
};

export const Medium: Story = {
  args: { size: '128' },
};

export const Large: Story = {
  args: { size: '512' },
};
