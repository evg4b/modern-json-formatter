import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { configureChromeMock } from '@testing/storybook';
import './query-input';

interface QueryInputArgs {
  error: string | null;
}

const meta = {
  title: 'Content Script/QueryInput',
  component: 'mjf-query-input',
  parameters: {
    events: ['jq-query'],
    docs: {
      description: {
        component: 'jq expression input. Enter submits, selected text is wrapped by typing a bracket or quote, '
          + 'Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z undo and redo, and previous queries for the domain are suggested.',
      },
    },
  },
  argTypes: {
    error: { control: 'text' },
  },
  args: {
    error: null,
  },
} satisfies Meta<QueryInputArgs>;

export default meta;
type Story = StoryObj<QueryInputArgs>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: 'Unexpected token in jq expression',
  },
};

export const LongError: Story = {
  args: {
    error: 'jq: error (at <stdin>:0): Cannot index array with "name" — use .[] to iterate over the array before selecting a key',
  },
};

export const WithoutHistory: Story = {
  beforeEach: () => {
    configureChromeMock({ history: [] });
  },
};

export const ManyHistoryItems: Story = {
  beforeEach: () => {
    configureChromeMock({
      history: Array.from({ length: 20 }, (_, index) => `.items[${index}] | .name`),
    });
  },
};
