import { beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { edgeUserAgent } from '@testing/user-agents';
import { getNodeWithCode } from './get-node-with-code';

describe('getNodeWithCode', () => {
  const addMarkup = (markup: string) => {
    document.body.innerHTML = markup;
    document.body.childNodes.forEach(node => {
      if (node instanceof HTMLElement) {
        node.innerText = node.innerHTML;
      }
    });
  };

  describe('detects pre element in base chrome view', () => {
    const cases = [
      {
        markup: '<pre>true</pre>',
        expected: 'true',
      },
      {
        markup: '<div>toolbox</div><pre>"some other text"</pre>',
        expected: '"some other text"',
      },
      {
        markup: '<div>toolbox</div><pre>{"id": 123}</pre><button>click me</button>',
        expected: '{"id": 123}',
      },
    ];

    test.each(cases)('%p', ({ markup, expected }) => {
      addMarkup(markup);
      const pre = getNodeWithCode(document.body.childNodes);
      expect(pre).not.toBeNull();
      expect(pre?.textContent).toBe(expected);
    });
  });

  describe('detects primitive documents', () => {
    const cases = [
      'null',
      'true',
      'false',
      '0',
      '21',
      '-21',
      '3.14',
      '-0.5',
      '1e400',
      '-12.5E-3',
      '"213123"',
      '"Not Found"',
      '""',
      '  null  ',
      '\t21\t',
    ];

    test.each(cases)('%s', body => {
      addMarkup(`<pre>${body}</pre>`);
      const pre = getNodeWithCode(document.body.childNodes);
      expect(pre).not.toBeNull();
      expect(pre?.textContent).toBe(body);
    });
  });

  describe('ignores common HTTP error responses', () => {
    const cases = [
      '400 Bad Request',
      '401 Unauthorized',
      '403 Forbidden',
      '404 Not Found',
      '404 page not found',
      '405 Method Not Allowed',
      '429 Too Many Requests',
      '500 Internal Server Error',
      '502 Bad Gateway',
      '503 Service Unavailable',
      '504 Gateway Timeout',
      'Not Found',
      'Forbidden',
      'Unauthorized',
      'Bad Request',
      'Internal Server Error',
      'Error 404: Not Found',
      'HTTP/1.1 404 Not Found',
      'nullable',
      'true story',
      'false alarm',
      '42 is the answer',
      '-',
    ];

    test.each(cases)('%s', body => {
      addMarkup(`<pre>${body}</pre>`);
      const pre = getNodeWithCode(document.body.childNodes);
      expect(pre).toBeNull();
    });
  });

  describe('detects not find element in other locations', () => {
    const cases = [
      { markup: '<div>test</div>' },
      { markup: '<div> toolbox <pre>some other text</pre> </div>' },
      { markup: '<div>toolbox <pre>some text</pre><button>click me</button> </div>' },
      { markup: '<pre>test</pre>' },
      { markup: '<div>toolbox</div><pre>some other text</pre>' },
      { markup: '<div>toolbox</div><pre>some text</pre><button>click me</button>' },
    ];

    test.each(cases)('$markup', ({ markup }) => {
      addMarkup(markup);
      const pre = getNodeWithCode(document.body.childNodes);
      expect(pre).toBeNull();
    });
  });

  describe('edge view', () => {
    beforeEach(() => {
      rstest.spyOn(window.navigator, 'userAgent', 'get')
        .mockImplementation(() => edgeUserAgent);
    });

    const cases = [
      {
        markup: '<pre>true</pre>',
        expected: 'true',
      },
      {
        markup: '<div>toolbox</div><pre>"some other text"</pre>',
        expected: '"some other text"',
      },
      {
        markup: '<div>toolbox</div><pre>{"id":123}</pre><button>click me</button>',
        expected: '{"id":123}',
      },
      {
        markup: '<div hidden>false</div>',
        expected: 'false',
      },
      {
        markup: '<div>toolbox</div><div hidden>\t"some other text"</div>',
        expected: '\t"some other text"',
      },
      {
        markup: '<div>toolbox</div><div hidden>123123</div><button>click me</button>',
        expected: '123123',
      },
      {
        markup: '<pre>["test 2"]</pre><div hidden>test 2</div>',
        expected: '["test 2"]',
      },
      {
        markup: '<div hidden>null</div>',
        expected: 'null',
      },
      {
        markup: '<div hidden>-21</div>',
        expected: '-21',
      },
    ];

    test.each(cases)('%p', ({ markup, expected }) => {
      addMarkup(markup);
      const div = getNodeWithCode(document.body.childNodes);
      expect(div).not.toBeNull();
      expect(div?.textContent).toBe(expected);
    });

    describe('detects not find element in other configuration', () => {
      const cases = [
        {
          markup: '<div>test</div>',
        },
        {
          markup: '<div hidden aria-checked="true">test</div>',
        },
        {
          markup: '<div>toolbox <pre>some text</pre><button>click me</button> </div>',
        },
        {
          markup: '<div>toolbox <div hidden>test</div><button>click me</button> </div>',
        },
        {
          markup: '<span>toolbox <span hidden>test</span><span>click me</span> </span>',
        },
      ];

      test.each(cases)('%p', ({ markup }) => {
        addMarkup(markup);
        const pre = getNodeWithCode(document.body.childNodes);
        expect(pre).toBeNull();
      });
    });
  });
});
