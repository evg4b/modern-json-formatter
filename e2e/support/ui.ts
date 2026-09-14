export type Tab = 'query' | 'formatted' | 'raw';

const container = 'body >>> mjf-container';
const toolbar = 'body >>> mjf-toolbox';
const queryInput = `${toolbar} >>> mjf-query-input`;
const property = (index: number) => `${container} >>> .root > .object > .inner > .property:nth-child(${index})`;
const item = (propertyIndex: number, itemIndex: number) => `${property(propertyIndex)} > .array > .inner > .item:nth-child(${itemIndex})`;

export const ui = {
  toolbar,
  // The rendered JSON tree, shown by both the formatted and the query tab.
  tree: `${container} >>> .root`,
  rawText: `${container} >>> pre`,
  rootToggle: `${container} >>> .root > .toggle`,
  propertyToggle: (index: number) => `${property(index)} > .toggle`,
  arrayItem: item,
  arrayItemToggle: (propertyIndex: number, itemIndex: number) => `${item(propertyIndex, itemIndex)} > .toggle`,
  // A jq expression producing several results renders them side by side.
  tuple: `${container} >>> .tuple`,
  tab: (tab: Tab) => `${toolbar} >>> button[data-type="${tab}"]`,
  download: `${toolbar} >>> button.square`,
  queryInput: `${queryInput} >>> input`,
  queryError: `${queryInput} >>> mjf-error-message`,
};
