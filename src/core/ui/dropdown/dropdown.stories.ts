import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { fn } from 'storybook/test';
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
      { label: 'Copy JSON', onClick: fn() },
      { label: 'Download file', onClick: fn() },
      { label: 'Open raw', onClick: fn() },
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
      { label: 'Format', onClick: fn() },
      { label: 'Minify', onClick: fn() },
    ],
    triggerLabel: 'Actions',
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { label: 'Option 1', onClick: fn() },
      { label: 'Option 2', onClick: fn() },
      { label: 'Option 3', onClick: fn() },
      { label: 'Option 4', onClick: fn() },
      { label: 'Option 5', onClick: fn() },
    ],
    triggerLabel: 'More',
  },
};
