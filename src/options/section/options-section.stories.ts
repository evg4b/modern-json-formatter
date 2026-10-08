import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './options-section';
import '../sections/download-mode-section';

const meta = {
  title: 'Options/OptionsSection',
  render: () => html`
    <mjf-options-section>
      <span slot="title">Section Title</span>
      <span slot="hint">A helpful description of what this section controls.</span>
      <p>Section content goes here.</p>
    </mjf-options-section>
  `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const WithLongHint: Story = {
  render: () => html`
    <mjf-options-section>
      <span slot="title">Download Mode</span>
      <span slot="hint">
        Choose how the download button behaves when you click it.
        You can have it open a dropdown menu, or download directly
        in the format of your choice.
      </span>
      <p>Content here.</p>
    </mjf-options-section>
  `,
};

export const WithoutHint: Story = {
  render: () => html`
    <mjf-options-section>
      <span slot="title">Section Title</span>
      <p>Section content goes here.</p>
    </mjf-options-section>
  `,
};

export const WithControl: Story = {
  render: () => html`
    <mjf-options-section>
      <span slot="title">Download Button Mode</span>
      <span slot="hint">Controls what happens when you click the download button.</span>
      <mjf-download-mode-section mode="dropdown"></mjf-download-mode-section>
    </mjf-options-section>
  `,
};
