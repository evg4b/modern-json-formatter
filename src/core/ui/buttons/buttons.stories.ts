import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './github-button';
import './chrome-web-store-button';
import './ko-fi-button';

const meta = {
  title: 'Core/Buttons',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const GitHub: Story = {
  render: () => html`<mjf-github-button></mjf-github-button>`,
};

export const ChromeWebStore: Story = {
  render: () => html`<mjf-chrome-web-store-button></mjf-chrome-web-store-button>`,
};

export const KoFi: Story = {
  render: () => html`<mjf-ko-fi-button></mjf-ko-fi-button>`,
};

export const AllButtons: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px; align-items: center;">
      <mjf-github-button></mjf-github-button>
      <mjf-chrome-web-store-button></mjf-chrome-web-store-button>
      <mjf-ko-fi-button></mjf-ko-fi-button>
    </div>
  `,
};
