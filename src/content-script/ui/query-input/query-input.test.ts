import '@testing/browser.mock';
import { describe } from '@rstest/core';
import { QueryInputElement } from './query-input.ts';
import { defaultLitAsserts, renderLitElement } from '@testing/lit.ts';

describe('mjf-query-input', () => {
  let queryInputElement: QueryInputElement;

  renderLitElement('mjf-query-input', element => queryInputElement = element);

  defaultLitAsserts(QueryInputElement, () => queryInputElement);
});
