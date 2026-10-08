import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import './table';
import type { TableColumn } from './table';

interface TableArgs {
  columns: TableColumn[];
  data: unknown[];
}

const meta = {
  title: 'Core/Table',
  component: 'mjf-table-element',
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

export const MissingValues: Story = {
  args: {
    data: [
      { name: 'modern-json-formatter', version: '2.0.0' },
      { name: 'lit', description: 'Fast, lightweight web components' },
      {},
    ],
  },
};

export const NestedPaths: Story = {
  args: {
    columns: [
      { title: 'Domain', path: 'domain' },
      { title: 'Queries', path: 'stats.queries' },
      { title: 'Last query', path: 'stats.last[0]' },
    ],
    data: [
      { domain: 'api.github.com', stats: { queries: 12, last: ['.items[]'] } },
      { domain: 'localhost:3000', stats: { queries: 3, last: ['keys'] } },
    ],
  },
};

export const ManyRows: Story = {
  args: {
    columns: [
      { title: 'Domain', path: 'domain' },
      { title: 'Count', path: 'count' },
    ],
    data: Array.from({ length: 30 }, (_, index) => ({ domain: `service-${index + 1}.example.com`, count: 90 - index * 3 })),
  },
};

export const NoColumns: Story = {
  args: {
    columns: [],
    data: [],
  },
};
