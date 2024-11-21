import { beforeEach, describe } from '@jest/globals';
import { edgeUserAgent } from '@testing/user-agents';
import { getNodeWithCode } from './get-node-with-code';

describe('getNodeWithCode', () => {
  describe('detects pre element in base chrome view', () => {
    const cases = [
      {
        markup: `<pre>test</pre>`,
        expected: 'test',
      },
      {
        markup: `<div>toolbox</div><pre>some other text</pre>`,
        expected: 'some other text',
      },
      {
        markup: `<div>toolbox</div><pre>some text</pre><button>click me</button>`,
        expected: 'some text',
      },
    ];

    test.each(cases)('%p', ({ markup, expected }) => {
      document.body.innerHTML = markup;
      const pre = getNodeWithCode(document.body.childNodes);
      expect(pre).not.toBeNull();
      expect(pre?.textContent).toBe(expected);
    });
  });

  describe('detects not find element in other locations', () => {
    const cases = [
      {
        markup: `<div>test</div>`,
      },
      {
        markup: `<div> toolbox <pre>some other text</pre> </div>`,
      },
      {
        markup: `<div>toolbox <pre>some text</pre><button>click me</button> </div>`,
      },
    ];

    test.each(cases)('%p', ({ markup }) => {
      document.body.innerHTML = markup;
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
        markup: `<pre>test</pre>`,
        expected: 'test',
      },
      {
        markup: `<div>toolbox</div><pre>some other text</pre>`,
        expected: 'some other text',
      },
      {
        markup: `<div>toolbox</div><pre>some text</pre><button>click me</button>`,
        expected: 'some text',
      },
      {
        markup: `<div hidden>test</div>`,
        expected: 'test',
      },
      {
        markup: `<div>toolbox</div><div hidden>some other text</div>`,
        expected: 'some other text',
      },
      {
        markup: `<div>toolbox</div><div hidden>some text</div><button>click me</button>`,
        expected: 'some text',
      },
      {
        markup: `<pre>text</pre><div hidden>test 2</div>`,
        expected: 'text',
      },
    ];

    test.each(cases)('%p', ({ markup, expected }) => {
      document.body.innerHTML = markup;
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
        document.body.innerHTML = markup;
        const pre = getNodeWithCode(document.body.childNodes);
        expect(pre).toBeNull();
      });
    });

  });
});
