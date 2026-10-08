import type { Decorator, Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { ContextProvider } from '@lit/context';
import { html, render, type ReactiveControllerHost, type TemplateResult } from 'lit';
import { SidebarController, sidebarControllerContext } from '../sidebar';
import lang, { type FaqSection } from '../sections';
import '../components/example-table';
import './section';

interface SectionArgs {
  section: keyof FaqSection;
}

const twoResults = ['1', '2'].join('\n');

const controllerHost: ReactiveControllerHost = {
  addController: () => undefined,
  removeController: () => undefined,
  requestUpdate: () => undefined,
  updateComplete: Promise.resolve(true),
};

const withSidebarContext: Decorator = story => {
  const host = document.createElement('div');
  new ContextProvider(host, {
    context: sidebarControllerContext,
    initialValue: new SidebarController(controllerHost),
  });
  render(story(), host);
  return host;
};

const renderSection = (content: TemplateResult<1> | null) => {
  const section = document.createElement('mjf-section');
  section.content = content;
  return section;
};

const meta = {
  title: 'FAQ/Section',
  decorators: [withSidebarContext],
  parameters: {
    docs: {
      description: {
        component: 'One chapter of the jq manual. Registers its headings with the sidebar controller from context.',
      },
    },
  },
  render: () => renderSection(html`
    <h2 id="custom-section">Custom section</h2>
    <p>Sections accept any template: paragraphs, <code>inline code</code> and examples.</p>
    <h3 id="custom-example">Example</h3>
    <pre><code>jq '.items[] | .name'</code></pre>
  `),
} satisfies Meta<SectionArgs>;

export default meta;
type Story = StoryObj<SectionArgs>;

export const Default: Story = {};

export const WithExamples: Story = {
  render: () => renderSection(html`
    <h2 id="examples-section">Examples</h2>
    <mjf-example-table query=".name" input='{"name":"Alice"}' output='"Alice"'></mjf-example-table>
    <mjf-example-table query=".[]" input="[1,2]" .output=${twoResults}></mjf-example-table>
  `),
};

export const Empty: Story = {
  render: () => renderSection(null),
};

export const ManualChapter: Story = {
  render: ({ section }) => renderSection(lang.en[section]),
  argTypes: {
    section: {
      control: { type: 'select' },
      options: Object.keys(lang.en),
    },
  },
  args: {
    section: 'basicFilters',
  },
};
