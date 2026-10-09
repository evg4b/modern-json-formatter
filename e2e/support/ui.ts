import type { DownloadType } from '@core/background/protocol';

export type Tab = 'query' | 'formatted' | 'raw';

const container = 'body >>> mjf-container';
const toolbar = 'body >>> mjf-toolbox';
const queryInput = `${toolbar} >>> mjf-query-input`;
const notice = `${container} >>> mjf-floating-message`;
const property = (index: number) => `${container} >>> .root > .object > .inner > .property:nth-child(${index})`;
const item = (propertyIndex: number, itemIndex: number) => `${property(propertyIndex)} > .array > .inner > .item:nth-child(${itemIndex})`;

const DOWNLOAD_OPTIONS: DownloadType[] = ['raw', 'formatted', 'minified'];

export const ui = {
  container,
  toolbar,
  tree: `${container} >>> .root`,
  rawText: `${container} >>> pre`,
  errorNode: `${container} >>> mjf-error-node >>> .message`,
  rootToggle: `${container} >>> .root > .toggle`,
  property,
  propertyToggle: (index: number) => `${property(index)} > .toggle`,
  arrayItem: item,
  arrayItemToggle: (propertyIndex: number, itemIndex: number) => `${item(propertyIndex, itemIndex)} > .toggle`,
  tuple: `${container} >>> .tuple`,
  tab: (tab: Tab) => `${toolbar} >>> button[data-type="${tab}"]`,
  download: `${toolbar} >>> button.square`,
  downloadMenu: `${toolbar} >>> mjf-dropdown`,
  downloadOption: (type: DownloadType) => `${toolbar} >>> mjf-dropdown >>> button:nth-child(${DOWNLOAD_OPTIONS.indexOf(type) + 1})`,
  notice,
  noticeHeader: `${notice} >>> .header`,
  noticeClose: `${notice} >>> .close`,
  queryInput: `${queryInput} >>> input`,
  queryError: `${queryInput} >>> mjf-error-message`,
  history: `${queryInput} >>> datalist`,
  historyOption: `${queryInput} >>> datalist > option`,
  manualLink: `${queryInput} >>> mjf-info-button >>> a`,
};
