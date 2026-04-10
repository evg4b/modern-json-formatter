import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './sidebar';
import '../../core/ui/buttons/github-button';
import '../../core/ui/buttons/ko-fi-button';
import '../../core/ui/buttons/chrome-web-store-button';
import type { NavigationItem } from './models';

interface SidebarArgs {
  active: string | null;
}

const makeItem = (id: string, title: string, children?: NavigationItem[]): NavigationItem => ({
  id,
  title,
  titleHtml: title,
  children,
  ref: document.createElement('section'),
});

const items: NavigationItem[] = [
  makeItem('getting-started', 'Getting Started'),
  makeItem('features', 'Features', [
    makeItem('big-numbers', 'Big Number Support'),
    makeItem('jq-queries', 'JQ Queries'),
    makeItem('key-ordering', 'Key Ordering'),
  ]),
  makeItem('options', 'Options'),
  makeItem('faq', 'FAQ'),
];

const meta = {
  title: 'FAQ/Sidebar',
  render: ({ active }) => html`
    <div style="width: 240px; height: 500px; overflow: auto;">
      <mjf-sidebar .items=${items} .active=${active}></mjf-sidebar>
    </div>
  `,
  args: {
    active: null,
  },
} satisfies Meta<SidebarArgs>;

export default meta;
type Story = StoryObj<SidebarArgs>;

export const Default: Story = {};

export const WithActiveItem: Story = {
  args: { active: 'features' },
};

export const WithActiveChild: Story = {
  args: { active: 'jq-queries' },
};
