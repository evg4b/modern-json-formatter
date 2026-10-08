import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { createElement } from '@core/dom';
import { format, query, tokenize } from '@wasm';
import type { TokenNode, TupleNode } from '@wasm/types';
import { withContainer } from '@testing/storybook';
import { buildDom } from '../../dom';
import { createErrorNode } from '../../extension';
import { getErrorMessage } from '../../helpers';
import './container';

interface ContainerArgs {
  type: TabType;
  json: string;
  jq: string;
}

const sample = JSON.stringify({
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
});

const brokenJson = '{"name": broken}';

const createContainer = (type: TabType) => {
  const container = document.createElement('mjf-container');
  container.type = type;
  return container;
};

const renderContainer = ({ type, json, jq }: ContainerArgs) => {
  const container = createContainer(type);
  container.setRawContent(createElement({ element: 'pre', content: json }));

  try {
    container.setFormattedContent(buildDom(tokenize(json) as TokenNode));
  } catch (error: unknown) {
    container.setError(error);
  }

  if (jq) {
    try {
      container.setQueryContent(buildDom(query(json, jq) as TupleNode));
    } catch (error: unknown) {
      container.setError(error);
    }
  }

  return container;
};

const meta = {
  title: 'Content Script/Container',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Root view of a formatted page. Holds the formatted, raw and query results and shows one of them depending on `type`. '
          + 'Stories run the real WASM tokenizer and jq engine on the `json` text.',
      },
    },
  },
  render: renderContainer,
  decorators: [withContainer({ minHeight: '400px' })],
  argTypes: {
    type: {
      control: { type: 'inline-radio' },
      options: ['formatted', 'raw', 'query'] satisfies TabType[],
    },
    json: { control: 'text' },
    jq: { control: 'text' },
  },
  args: {
    type: 'formatted',
    json: sample,
    jq: '',
  },
} satisfies Meta<ContainerArgs>;

export default meta;
type Story = StoryObj<ContainerArgs>;

export const Formatted: Story = {};

export const Raw: Story = {
  args: { type: 'raw' },
};

export const QueryNotRunYet: Story = {
  args: { type: 'query' },
};

export const QueryResults: Story = {
  args: { type: 'query', jq: '.releases[] | .version' },
};

export const QuerySingleResult: Story = {
  args: { type: 'query', jq: '.owner' },
};

export const StringRoot: Story = {
  args: { json: '"Hello, world!"' },
};

export const NumberRoot: Story = {
  args: { json: '12345678909876543212345' },
};

export const EmptyObject: Story = {
  args: { json: '{}' },
};

export const EmptyArray: Story = {
  args: { json: '[]' },
};

export const ArrayRoot: Story = {
  args: {
    json: '[{"id":1,"title":"delectus aut autem","completed":false},'
      + '{"id":2,"title":"quis ut nam facilis","completed":true},'
      + '{"id":3,"title":"fugiat veniam minus","completed":false}]',
  },
};

export const BigNumbers: Story = {
  args: {
    json: '{"int64":9223372036854775807,"beyondSafeInteger":12345678901234567890123,'
      + '"highPrecision":3.141592653589793238462643383279,"exponent":1.7976931348623157e+308,'
      + '"trailingZeros":1.000,"negative":-0.000000000000000000001}',
  },
};

export const KeyOrder: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Keys keep their source order, including integer-like keys that `JSON.parse` would move to the front.',
      },
    },
  },
  args: { json: '{"zebra":1,"apple":2,"10":3,"2":4,"_id":5}' },
};

export const LinksAndEmails: Story = {
  args: {
    json: '{"https":"https://example.com","http":"http://localhost:8080/api/v1/items?page=2",'
      + '"ftp":"ftp://files.example.com/dump.json","mailto":"mailto:hello@example.com",'
      + '"email":"hello@example.com","noScheme":"example.com","noHost":"https:///path"}',
  },
};

export const UnicodeAndEscapes: Story = {
  args: {
    json: '{"emoji":"🚀 ✨","cyrillic":"Привет, мир","cjk":"你好，世界",'
      + String.raw`"escapes":"line 1\nline 2\t\"quoted\" \\ backslash","unicodeEscape":"\u00e9\u00e8",`
      + '"key with spaces":"value","":"empty key"}',
  },
};

export const DeeplyNested: Story = {
  args: { json: '{"level1":{"level2":{"level3":{"level4":{"level5":{"level6":["deep",{"value":true}]}}}}}}' },
};

export const LongValues: Story = {
  args: {
    json: JSON.stringify({
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(12),
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'.repeat(8),
    }),
  },
};

export const LargeArray: Story = {
  args: {
    json: JSON.stringify(Array.from({ length: 200 }, (_, index) => ({ index, even: index % 2 === 0 }))),
  },
};

export const CollapsedNodes: Story = {
  render: ({ json }) => {
    const tree = buildDom(tokenize(json) as TokenNode);
    tree.querySelectorAll<HTMLElement>('.property > .toggle').forEach(toggle => toggle.click());

    const container = createContainer('formatted');
    container.setFormattedContent(tree);
    return container;
  },
};

export const TrailingComma: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The parser tolerates trailing commas, so this page is formatted rather than rejected.',
      },
    },
  },
  args: { json: '{"name": "lenient", "tags": ["a", "b",], }' },
};

export const InvalidJson: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Text that looks like JSON but does not parse: the extension logs the tokenizer error and the formatted tab stays empty.',
      },
    },
  },
  args: { json: brokenJson },
};

export const LargeFile: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Above the size limit the page is only pretty-printed into the raw tab and a notice is shown.',
      },
    },
  },
  render: ({ json }) => {
    const container = createContainer('raw');
    container.setRawContent(createElement({ element: 'pre', content: format(json) }));
    queueMicrotask(() => container.message(
      'File is too large',
      'File is too large to be processed (More than 10MB). It has been formatted instead.',
    ));
    return container;
  },
};

export const LargeFileInvalidJson: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Above the size limit, a file that fails to parse shows the formatter error in the raw tab.',
      },
    },
  },
  args: { json: brokenJson },
  render: ({ json }) => {
    const container = createContainer('raw');
    try {
      container.setRawContent(createElement({ element: 'pre', content: format(json) }));
    } catch (error: unknown) {
      container.setRawContent(createErrorNode('Failed to process file', getErrorMessage(error)));
    }
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
