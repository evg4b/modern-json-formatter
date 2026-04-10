import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import './table';
import type { TableColumn } from './table';

interface TableArgs {
  columns: TableColumn[];
  data: unknown[];
}

const meta = {
  title: 'Core/Table',
  render: ({ columns, data }) => html`
    <mjf-table-element
      .columns=${columns}
      .data=${data}
    ></mjf-table-element>
  `,
  args: {
    columns: [
      { title: 'Name', path: 'name' },
      { title: 'Version', path: 'version' },
      { title: 'Description', path: 'description' },
    ],
    data: [
      { name: 'modern-json-formatter', version: '2.0.0', description: 'JSON formatter extension' },
      { name: 'lit', version: '3.0.0', description: 'Fast, lightweight web components' },
      { name: 'typescript', version: '5.0.0', description: 'TypeScript language' },
    ],
  },
} satisfies Meta<TableArgs>;

export default meta;
type Story = StoryObj<TableArgs>;

export const WithData: Story = {};

export const Empty: Story = {
  args: {
    data: [],
  },
};

export const SingleColumn: Story = {
  args: {
    columns: [{ title: 'Package', path: 'name' }],
    data: [
      { name: 'modern-json-formatter' },
      { name: 'lit' },
      { name: 'typescript' },
    ],
  },
};
