import '@testing/browser.mock';
import { describe } from '@rstest/core';
import { ToolboxElement } from './toolbox';
import { defaultLitAsserts, renderLitElement } from '@testing/lit';

describe('mjf-toolbox', () => {
  let toolbox: ToolboxElement;

  renderLitElement('mjf-toolbox', element => toolbox = element);

  defaultLitAsserts(ToolboxElement, () => toolbox);
});
