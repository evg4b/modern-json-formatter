import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html, type TemplateResult } from 'lit';
import { createSidebarContextHost } from '@testing/storybook/sidebar-context';
import '@testing/storybook/chrome.mock';
import lang from '../sections';
import type { FaqSection } from '../sections/models';
import './section';
import '../components/example-table/example-table';

interface SectionArgs {
  section: keyof FaqSection;
}

const renderSection = (content: TemplateResult<1>) => {
  const section = document.createElement('mjf-section');
  section.content = content;
  return createSidebarContextHost(section);
};

const meta = {
  title: 'FAQ/Section',
  parameters: {
    docs: {
      description: {
        component: 'Renders one markdown chapter of the jq manual. Registers its headings with the sidebar controller from context.',
      },
    },
  },
  render: ({ section }) => renderSection(lang.en[section]),
  argTypes: {
    section: {
      control: { type: 'select' },
      options: Object.keys(lang.en),
    },
  },
  args: {
    section: 'intro',
  },
} satisfies Meta<SectionArgs>;

export default meta;
type Story = StoryObj<SectionArgs>;

export const Intro: Story = {};

export const BasicFilters: Story = {
  args: { section: 'basicFilters' },
};

export const TypesAndValues: Story = {
  args: { section: 'typesAndValues' },
};

export const BuiltinOperatorsAndFunctions: Story = {
  args: { section: 'builtinOperatorsAndFunctions' },
};

export const ConditionalsAndComparisons: Story = {
  args: { section: 'conditionalsAndComparisons' },
};

export const RegularExpressions: Story = {
  args: { section: 'regularExpressions' },
};

export const AdvancedFeatures: Story = {
  args: { section: 'advancedFeatures' },
};

export const Math: Story = {
  args: { section: 'math' },
};

export const Assignment: Story = {
  args: { section: 'assignment' },
};

export const Hashing: Story = {
  args: { section: 'hashing' },
};

export const CustomContent: Story = {
  render: () => renderSection(html`
    <h2 id="custom-section">Custom section</h2>
    <p>Sections accept any template: paragraphs, <code>inline code</code> and examples.</p>
    <h3 id="custom-example">Example</h3>
    <pre><code>jq '.items[] | .name'</code></pre>
    <mjf-example-table query=".name" input='{"name":"Alice"}' output='"Alice"'></mjf-example-table>
    <mjf-example-table query=".[]" input="[1,2]" output="1, 2"></mjf-example-table>
  `),
};

export const Empty: Story = {
  render: () => createSidebarContextHost(document.createElement('mjf-section')),
};
