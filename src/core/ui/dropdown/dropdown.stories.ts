import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { html } from 'lit';
import './dropdown';
import type { DropdownOption } from './dropdown';

interface DropdownArgs {
  options: DropdownOption[];
  triggerLabel: string;
}

const meta = {
  title: 'Core/Dropdown',
  render: ({ options, triggerLabel }) => {
    const id = 'story-dropdown';

    return html`
      <div style="padding: 16px;">
        <button popovertarget=${id} style="padding: 6px 12px; cursor: pointer;">
          ${triggerLabel}
        </button>
        <mjf-dropdown id=${id} .options=${options}></mjf-dropdown>
      </div>
    `;
  },
  args: {
    options: [
      { label: 'Copy JSON', onClick: action('copy-json') },
      { label: 'Download file', onClick: action('download-file') },
      { label: 'Open raw', onClick: action('open-raw') },
    ],
    triggerLabel: 'Open menu',
  },
} satisfies Meta<DropdownArgs>;

export default meta;
type Story = StoryObj<DropdownArgs>;

export const Default: Story = {};

export const FewOptions: Story = {
  args: {
    options: [
      { label: 'Format', onClick: action('format') },
      { label: 'Minify', onClick: action('minify') },
    ],
    triggerLabel: 'Actions',
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { label: 'Option 1', onClick: action('option-1') },
      { label: 'Option 2', onClick: action('option-2') },
      { label: 'Option 3', onClick: action('option-3') },
      { label: 'Option 4', onClick: action('option-4') },
      { label: 'Option 5', onClick: action('option-5') },
    ],
    triggerLabel: 'More',
  },
};
