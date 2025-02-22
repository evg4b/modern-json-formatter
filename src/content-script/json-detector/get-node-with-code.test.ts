import { beforeEach, describe } from '@jest/globals';
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
        markup: `<pre>true</pre>`,
        expected: 'true',
      },
      {
        markup: `<div>toolbox</div><pre>"some other text"</pre>`,
        expected: '"some other text"',
      },
      {
        markup: `<div>toolbox</div><pre>{"id": 123}</pre><button>click me</button>`,
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

  describe('detects not find element in other locations', () => {
    const cases = [
      { markup: `<div>test</div>` },
      { markup: `<div> toolbox <pre>some other text</pre> </div>` },
      { markup: `<div>toolbox <pre>some text</pre><button>click me</button> </div>` },
      { markup: `<pre>test</pre>` },
      { markup: `<div>toolbox</div><pre>some other text</pre>` },
      { markup: `<div>toolbox</div><pre>some text</pre><button>click me</button>` },
    ];

    test.each(cases)('%p', ({ markup }) => {
      addMarkup(markup);
      const pre = getNodeWithCode(document.body.childNodes);
      expect(pre).toBeNull();
    });
  });

  describe('edge view', () => {
    beforeEach(() => {
      jest.spyOn(window.navigator, 'userAgent', 'get')
        .mockImplementation(() => edgeUserAgent);
    });

    const cases = [
      {
        markup: `<pre>true</pre>`,
        expected: 'true',
      },
      {
        markup: `<div>toolbox</div><pre>"some other text"</pre>`,
        expected: '"some other text"',
      },
      {
        markup: `<div>toolbox</div><pre>{"id":123}</pre><button>click me</button>`,
        expected: '{"id":123}',
      },
      {
        markup: `<div hidden>false</div>`,
        expected: 'false',
      },
      {
        markup: `<div>toolbox</div><div hidden>\t"some other text"</div>`,
        expected: '\t"some other text"',
      },
      {
        markup: `<div>toolbox</div><div hidden>123123</div><button>click me</button>`,
        expected: '123123',
      },
      {
        markup: `<pre>["test 2"]</pre><div hidden>test 2</div>`,
        expected: '["test 2"]',
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
          markup: `<div>test</div>`,
        },
        {
          markup: `<div hidden aria-checked="true">test</div>`,
        },
        {
          markup: `<div>toolbox <pre>some text</pre><button>click me</button> </div>`,
        },
        {
          markup: `<div>toolbox <div hidden>test</div><button>click me</button> </div>`,
        },
        {
          markup: `<span>toolbox <span hidden>test</span><span>click me</span> </span>`,
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
