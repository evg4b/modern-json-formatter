import { createElement, Options } from '@core/dom/create-element';
import { describe, expect } from '@jest/globals';

describe('createElement', () => {
  const testCases: Options<'span' | 'div' | 'input' | 'a'>[] = [
    { element: 'span' },
    { element: 'span', class: 'test' },
    { element: 'span', class: 'test', content: 'test content' },
    { element: 'span', class: ['test1', 'test2', 'test3'], content: 'test content' },
    {
      element: 'span',
      children: [
        createElement({ element: 'span', content: 'test1' }),
        createElement({ element: 'span', content: 'test2' }),
        createElement({ element: 'span', content: 'test3' }),
      ],
    },
    { element: 'span', content: 'test content', attributes: { ref: 'test' } },
    { element: 'span', html: '<span>test</span>' },
    { element: 'div' },
    { element: 'div', class: 'test' },
    { element: 'div', class: 'test', content: 'test content' },
    { element: 'div', class: ['test1', 'test2', 'test3'], content: 'test content' },
    {
      element: 'div',
      children: [
        createElement({ element: 'div', content: 'test1' }),
        createElement({ element: 'div', content: 'test2' }),
        createElement({ element: 'div', content: 'test3' }),
      ],
    },
    { element: 'div', content: 'test content', attributes: { 'aria-data': 'test' } },
    { element: 'div', html: '<span>test</span>' },
    { element: 'a' },
    { element: 'a', class: 'test' },
    { element: 'a', class: 'test', content: 'test content' },
    { element: 'a', class: ['test1', 'test2', 'test3'], content: 'test content' },
    {
      element: 'a',
      children: [
        createElement({ element: 'span', content: 'test1' }),
        createElement({ element: 'span', content: 'test2' }),
        createElement({ element: 'span', content: 'test3' }),
      ],
    },
    { element: 'a', content: 'test content', attributes: { href: 'http://test' } },
    { element: 'a', html: '<span>test</span>' },
    { element: 'input' },
    { element: 'input', class: 'test' },
    { element: 'input', class: ['test1', 'test2', 'test3'] },
    { element: 'input', content: 'test content', attributes: { test: 'data' } },
  ];

  test.each(testCases)('%p', options => {
    expect(createElement(options)).toMatchSnapshot();
  });
});
