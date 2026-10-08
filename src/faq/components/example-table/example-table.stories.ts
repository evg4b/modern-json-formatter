import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import { configureChromeMock } from '@testing/storybook';
import './example-table';

interface ExampleTableArgs {
  query: string;
  input: string;
  output: string;
}

const meta = {
  title: 'FAQ/ExampleTable',
  render: ({ query, input, output }) => html`
    <mjf-example-table
      query=${query}
      input=${input}
      output=${output}
    ></mjf-example-table>
  `,
  args: {
    query: '.name',
    input: '{"name": "Alice", "age": 30}',
    output: '"Alice"',
  },
  parameters: {
    docs: {
      description: {
        component: 'Runnable jq example. Press the play button or Enter to evaluate the query against the input '
          + '(here via a small jq subset instead of the WASM worker).',
      },
    },
  },
} satisfies Meta<ExampleTableArgs>;

export default meta;
type Story = StoryObj<ExampleTableArgs>;

export const Default: Story = {};

export const ArrayQuery: Story = {
  args: {
    query: '.[] | .name',
    input: '[{"name":"Alice"},{"name":"Bob"}]',
    output: '"Alice"\n"Bob"',
  },
};

export const FilterQuery: Story = {
  args: {
    query: '.items[] | select(.active)',
    input: '{"items":[{"id":1,"active":true},{"id":2,"active":false}]}',
    output: '{"id":1,"active":true}',
  },
};

export const MultipleResults: Story = {
  args: {
    query: '.[]',
    input: '[1, "two", {"three": 3}]',
    output: '1\n"two"\n{"three":3}',
  },
};

export const InvalidQuery: Story = {
  args: {
    query: 'not_a_function',
    input: '{"a": 1}',
    output: '',
  },
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('mjf-example-table');
    await table?.updateComplete;
    table?.shadowRoot?.querySelector('button')?.click();
  },
};

export const InvalidInput: Story = {
  args: {
    query: '.',
    input: '{ broken',
    output: '',
  },
  play: InvalidQuery.play,
};

export const Running: Story = {
  beforeEach: () => {
    configureChromeMock({ latency: 60_000 });
  },
  play: InvalidQuery.play,
};

export const Executed: Story = {
  args: {
    query: '.items | length',
    input: '{"items":[1,2,3]}',
    output: '3',
  },
  play: InvalidQuery.play,
};
