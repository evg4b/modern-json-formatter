import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './side-bar-link';
import type { NavigationItem } from './models';

interface SidebarLinkArgs {
  active: boolean;
  label: string;
}

const makeItem = (label: string): NavigationItem => ({
  id: label.toLowerCase().replace(/\s+/g, '-'),
  title: label,
  titleHtml: label,
  ref: document.createElement('section'),
});

const meta = {
  title: 'FAQ/SidebarLink',
  render: ({ active, label }) => html`
    <mjf-sidebar-link .item=${makeItem(label)} .active=${active}>
      <span>${label}</span>
    </mjf-sidebar-link>
  `,
  argTypes: {
    active: { control: 'boolean' },
  },
  args: {
    active: false,
    label: 'Getting Started',
  },
} satisfies Meta<SidebarLinkArgs>;

export default meta;
type Story = StoryObj<SidebarLinkArgs>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};
