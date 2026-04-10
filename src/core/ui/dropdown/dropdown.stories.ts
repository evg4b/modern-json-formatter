import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './dropdown';
import type { DropdownOption } from './dropdown';

interface DropdownArgs {
  options: DropdownOption[];
  triggerLabel: string;
}

const defaultOptions: DropdownOption[] = [
  { label: 'Copy JSON', onClick: () => alert('Copy JSON') },
  { label: 'Download file', onClick: () => alert('Download file') },
  { label: 'Open raw', onClick: () => alert('Open raw') },
];

const meta = {
  title: 'Core/Dropdown',
  render: ({ options, triggerLabel }) => {
    const id = 'story-dropdown';

    return html`
      <div style="padding: 16px;">
        <button
          popovertarget=${id}
          style="padding: 6px 12px; cursor: pointer;"
        >
          ${triggerLabel}
        </button>
        <mjf-dropdown id=${id} .options=${options}></mjf-dropdown>
      </div>
    `;
  },
  args: {
    options: defaultOptions,
    triggerLabel: 'Open menu',
  },
} satisfies Meta<DropdownArgs>;

export default meta;
type Story = StoryObj<DropdownArgs>;

export const Default: Story = {};

export const FewOptions: Story = {
  args: {
    options: [
      { label: 'Format', onClick: () => alert('Format') },
      { label: 'Minify', onClick: () => alert('Minify') },
    ],
    triggerLabel: 'Actions',
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { label: 'Option 1', onClick: () => {} },
      { label: 'Option 2', onClick: () => {} },
      { label: 'Option 3', onClick: () => {} },
      { label: 'Option 4', onClick: () => {} },
      { label: 'Option 5', onClick: () => {} },
    ],
    triggerLabel: 'More',
  },
};
