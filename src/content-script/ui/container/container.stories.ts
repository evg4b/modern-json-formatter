import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { createElement } from '@core/dom';
import type { TokenizerResponse } from '@wasm/types';
import { toTokens, toTuple } from '@testing/storybook/tokens';
import { buildDom } from '../../dom';
import '../error-node';
import './container';

interface ContainerArgs {
  type: TabType;
  json: unknown;
}

const sample = {
  id: 1024,
  name: 'Modern JSON Formatter',
  active: true,
  rating: 4.9,
  license: null,
  homepage: 'https://github.com/evg4b/modern-json-formatter',
  support: 'support@example.com',
  tags: ['json', 'jq', 'formatter'],
  owner: {
    login: 'evg4b',
    repos: 42,
    links: {
      profile: 'https://github.com/evg4b',
    },
  },
  releases: [
    { version: '2.1.0', stable: true },
    { version: '2.0.0', stable: true },
    { version: '2.2.0-beta.1', stable: false },
  ],
  empty: {
    object: {},
    array: [],
    string: '',
  },
};

const createErrorNode = (header: string, ...lines: string[]) => {
  const node = document.createElement('mjf-error-node');
  node.header = header;
  node.lines = lines;
  return node;
};

const buildContent = (response: TokenizerResponse): HTMLElement => {
  return response.type === 'error'
    ? createErrorNode('Invalid JSON file.', response.error)
    : buildDom(response);
};

const createContainer = (type: TabType) => {
  const container = document.createElement('mjf-container');
  container.type = type;
  return container;
};

const meta = {
  title: 'Content Script/Container',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Root view of a formatted page. Holds the formatted, raw and query results and shows one of them depending on `type`.',
      },
    },
  },
  render: ({ type, json }) => {
    const container = createContainer(type);
    const raw = JSON.stringify(json);
    container.setRawContent(createElement({ element: 'pre', content: raw }));
    container.setFormattedContent(buildContent(toTokens(json)));
    container.setQueryContent(buildContent(toTokens(json)));
    return container;
  },
  argTypes: {
    type: {
      control: { type: 'inline-radio' },
      options: ['formatted', 'raw', 'query'] satisfies TabType[],
    },
    json: { control: 'object' },
  },
  args: {
    type: 'formatted',
    json: sample,
  },
} satisfies Meta<ContainerArgs>;

export default meta;
type Story = StoryObj<ContainerArgs>;

export const Formatted: Story = {};

export const Raw: Story = {
  args: { type: 'raw' },
};

export const Query: Story = {
  args: { type: 'query' },
};

export const PrimitiveRoots: Story = {
  render: () => {
    const container = createContainer('formatted');
    container.setFormattedContent(buildDom(toTuple('plain string', 42, -0.5, true, false, null)));
    return container;
  },
};

export const EmptyObject: Story = {
  args: { json: {} },
};

export const EmptyArray: Story = {
  args: { json: [] },
};

export const ArrayRoot: Story = {
  args: {
    json: [
      { id: 1, title: 'delectus aut autem', completed: false },
      { id: 2, title: 'quis ut nam facilis', completed: true },
      { id: 3, title: 'fugiat veniam minus', completed: false },
    ],
  },
};

export const BigNumbers: Story = {
  render: () => {
    const container = createContainer('formatted');
    container.setFormattedContent(buildDom({
      type: 'object',
      properties: [
        { key: 'int64', value: { type: 'number', value: '9223372036854775807' } },
        { key: 'beyondSafeInteger', value: { type: 'number', value: '12345678901234567890123' } },
        { key: 'highPrecision', value: { type: 'number', value: '3.141592653589793238462643383279' } },
        { key: 'exponent', value: { type: 'number', value: '1.7976931348623157e+308' } },
        { key: 'negative', value: { type: 'number', value: '-0.000000000000000000001' } },
      ],
    }));
    return container;
  },
};

export const LinksAndEmails: Story = {
  args: {
    json: {
      website: 'https://example.com',
      api: 'http://localhost:8080/api/v1/items?page=2',
      email: 'hello@example.com',
      notALink: 'example.com',
    },
  },
};

export const UnicodeAndEscapes: Story = {
  args: {
    json: {
      'emoji': '🚀 ✨',
      'cyrillic': 'Привет, мир',
      'cjk': '你好，世界',
      'escapes': 'line 1\nline 2\t"quoted" \\ backslash',
      'key with spaces': 'value',
      '': 'empty key',
    },
  },
};

export const DeeplyNested: Story = {
  args: {
    json: { level1: { level2: { level3: { level4: { level5: { level6: ['deep', { value: true }] } } } } } },
  },
};

export const LongValues: Story = {
  args: {
    json: {
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(12),
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'.repeat(8),
    },
  },
};

export const LargeArray: Story = {
  args: {
    json: Array.from({ length: 200 }, (_, index) => ({ index, even: index % 2 === 0 })),
  },
};

export const CollapsedNodes: Story = {
  play: ({ canvasElement }) => {
    // The formatted tree lives behind a closed shadow root; collapse through the public toggles instead.
    const container = canvasElement.querySelector('mjf-container');
    const formatted = container && Reflect.get(container, 'formatted') as HTMLElement | undefined;
    formatted?.querySelectorAll<HTMLElement>('.property > .toggle').forEach(toggle => toggle.click());
  },
};

export const QueryTuple: Story = {
  render: () => {
    const container = createContainer('query');
    container.setQueryContent(buildDom(toTuple('2.1.0', '2.0.0', '2.2.0-beta.1')));
    return container;
  },
};

export const InvalidJson: Story = {
  render: () => {
    const container = createContainer('formatted');
    container.setFormattedContent(createErrorNode(
      'Invalid JSON file.',
      'expected `,` or `}` at line 3 column 5',
    ));
    return container;
  },
};

export const Loading: Story = {
  render: () => {
    const container = createContainer('formatted');
    container.startLoading();
    return container;
  },
};

export const InfoMessage: Story = {
  render: () => {
    const container = createContainer('raw');
    container.setRawContent(createElement({ element: 'pre', content: JSON.stringify(sample, null, 2) }));
    queueMicrotask(() => container.message(
      'File is too large',
      'File is too large to be processed (More than 10MB). It has been formatted instead.',
    ));
    return container;
  },
};
