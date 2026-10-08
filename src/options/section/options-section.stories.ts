import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import type { ChildrenArgs } from '@testing/storybook';
import './options-section';
import '../sections';

const meta = {
  title: 'Options/OptionsSection',
  component: 'mjf-options-section',
  argTypes: {
    children: { control: false },
  },
  args: {
    children: html`
      <span slot="title">Section Title</span>
      <span slot="hint">A helpful description of what this section controls.</span>
      <p>Section content goes here.</p>
    `,
  },
} satisfies Meta<ChildrenArgs>;

export default meta;
type Story = StoryObj<ChildrenArgs>;

export const Default: Story = {};

export const WithLongHint: Story = {
  args: {
    children: html`
      <span slot="title">Download Mode</span>
      <span slot="hint">
        Choose how the download button behaves when you click it.
        You can have it open a dropdown menu, or download directly
        in the format of your choice.
      </span>
      <p>Content here.</p>
    `,
  },
};

export const WithoutHint: Story = {
  args: {
    children: html`
      <span slot="title">Section Title</span>
      <p>Section content goes here.</p>
    `,
  },
};

export const WithControl: Story = {
  args: {
    children: html`
      <span slot="title">Download Button Mode</span>
      <span slot="hint">Controls what happens when you click the download button.</span>
      <mjf-download-mode-section mode="dropdown"></mjf-download-mode-section>
    `,
  },
};
