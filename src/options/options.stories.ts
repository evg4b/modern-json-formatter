import type { Meta, StoryObj } from 'storybook-web-components-rsbuild';
import { html } from 'lit';
import { configureChromeMock } from '@testing/storybook/chrome.mock';
import './options';

const meta = {
  title: 'Options/Page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Extension settings page. Settings and query history come from a fake `chrome` runtime; '
          + 'changes persist until the story is reloaded.',
      },
    },
  },
  // A fresh element per story: the page reads settings and history once, when it is created.
  render: () => html`<mjf-options-page></mjf-options-page>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const EmptyHistory: Story = {
  beforeEach: () => {
    configureChromeMock({ domains: [] });
  },
};

export const ManyDomains: Story = {
  beforeEach: () => {
    configureChromeMock({
      domains: Array.from({ length: 25 }, (_, index) => ({
        domain: `service-${index + 1}.example.com`,
        count: 100 - index * 3,
      })),
    });
  },
};

export const LoadingHistory: Story = {
  beforeEach: () => {
    configureChromeMock({ latency: 60_000 });
  },
};

export const CustomSettings: Story = {
  beforeEach: () => {
    configureChromeMock({
      settings: {
        buttons: { query: true, formatted: true, raw: false, download: true },
        downloadMode: 'minified',
        maxFileSize: 25,
      },
    });
  },
};

export const DownloadDisabled: Story = {
  beforeEach: () => {
    configureChromeMock({
      settings: {
        buttons: { query: true, formatted: true, raw: true, download: false },
      },
    });
  },
};
