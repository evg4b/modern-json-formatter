import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import './error-node';

interface ErrorNodeArgs {
  header: string;
  lines: string[];
}

const meta = {
  title: 'Content Script/ErrorNode',
  component: 'mjf-error-node',
  args: {
    header: 'Invalid JSON',
    lines: ['Unexpected token at position 42', 'Expected "}" but got ","'],
  },
} satisfies Meta<ErrorNodeArgs>;

export default meta;
type Story = StoryObj<ErrorNodeArgs>;

export const Default: Story = {};

export const SingleLine: Story = {
  args: {
    header: 'Parse error',
    lines: ['Unexpected end of input'],
  },
};

export const NoDetails: Story = {
  args: {
    header: 'Empty response',
    lines: [],
  },
};

export const ManyLines: Story = {
  args: {
    header: 'Failed to process file',
    lines: [
      'expected value at line 1 column 1',
      'while parsing the response body',
      'Content-Type: application/json; charset=utf-8',
      'Content-Length: 18342',
    ],
  },
};

export const LongLine: Story = {
  args: {
    header: 'Invalid JSON file.',
    lines: [`unexpected character at ${'{"key":"value",'.repeat(20)}`],
  },
};
