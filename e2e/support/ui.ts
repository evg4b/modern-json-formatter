export type Tab = 'query' | 'formatted' | 'raw';

const container = 'body >>> mjf-container';
const toolbar = 'body >>> mjf-toolbox';
const queryInput = `${toolbar} >>> mjf-query-input`;
const property = (index: number) => `${container} >>> .root > .object > .inner > .property:nth-child(${index})`;

export const ui = {
  toolbar,
  // The rendered JSON tree, shown by both the formatted and the query tab.
  tree: `${container} >>> .root`,
  rawText: `${container} >>> pre`,
  rootToggle: `${container} >>> .root > .toggle`,
  propertyToggle: (index: number) => `${property(index)} > .toggle`,
  tab: (tab: Tab) => `${toolbar} >>> button[data-type="${tab}"]`,
  download: `${toolbar} >>> button.square`,
  queryInput: `${queryInput} >>> input`,
  queryError: `${queryInput} >>> mjf-error-message`,
};
