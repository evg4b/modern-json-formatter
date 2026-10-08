import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import type { ChildrenArgs } from '@testing/storybook';
import './side-bar-link';
import type { NavigationItem } from './models';

interface SidebarLinkArgs extends ChildrenArgs {
  item: NavigationItem;
  active: boolean;
}

const link = (label: string): Pick<SidebarLinkArgs, 'item' | 'children'> => ({
  item: {
    id: label.toLowerCase().replaceAll(/\s+/g, '-'),
    title: label,
    titleHtml: label,
    ref: document.createElement('section'),
  },
  children: label,
});

const meta = {
  title: 'FAQ/SidebarLink',
  component: 'mjf-sidebar-link',
  argTypes: {
    active: { control: 'boolean' },
  },
  args: {
    active: false,
    ...link('Getting Started'),
  },
} satisfies Meta<SidebarLinkArgs>;

export default meta;
type Story = StoryObj<SidebarLinkArgs>;

export const Default: Story = {};

export const Active: Story = {
  args: { active: true },
};

export const LongLabel: Story = {
  args: link('Object Identifier-Index and Optional Object Identifier-Index'),
};
