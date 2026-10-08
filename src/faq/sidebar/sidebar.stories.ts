import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './sidebar';
import type { NavigationItem } from './models';

interface SidebarArgs {
  items: NavigationItem[];
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
  render: ({ items, active }) => html`
    <div style="width: 240px; height: 500px; overflow: auto;">
      <mjf-sidebar .items=${items} .active=${active}></mjf-sidebar>
    </div>
  `,
  args: {
    items,
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

export const Empty: Story = {
  args: { items: [] },
};

export const FlatList: Story = {
  args: {
    items: [
      makeItem('intro', 'Introduction'),
      makeItem('basic-filters', 'Basic filters'),
      makeItem('types-and-values', 'Types and Values'),
    ],
  },
};

export const ManyItems: Story = {
  args: {
    items: Array.from({ length: 12 }, (_, section) => makeItem(
      `section-${section}`,
      `Section ${section + 1}`,
      Array.from({ length: 5 }, (__, child) => makeItem(`section-${section}-${child}`, `Topic ${section + 1}.${child + 1}`)),
    )),
    active: 'section-6-2',
  },
};

export const CodeInTitles: Story = {
  args: {
    items: [
      {
        ...makeItem('identity', 'Identity: .'),
        titleHtml: 'Identity: <code>.</code>',
      },
      {
        ...makeItem('object-index', 'Object Identifier-Index: .foo, .foo.bar'),
        titleHtml: 'Object Identifier-Index: <code>.foo</code>, <code>.foo.bar</code>',
      },
    ],
    active: 'identity',
  },
};
