import { describe, test } from '@jest/globals';
import { arcUserAgent, chromeUserAgent, edgeUserAgent, operaUserAgent, yandexUserAgent } from '@testing/user-agents';
import { type Browser } from './browser';
import { getJsonSelector } from './detect';
import { selectors } from './selectors';

interface TestCase {
  browser: string;
  userAgent: string;
  expected: Browser;
}

describe('getJsonSelector', () => {
  const testCases: TestCase[] = [
    { browser: 'edge', userAgent: edgeUserAgent, expected: 'edge' },
    { browser: 'chrome', userAgent: chromeUserAgent, expected: 'chrome' },
    { browser: 'opera', userAgent: operaUserAgent, expected: 'chrome' },
    { browser: 'yandex', userAgent: yandexUserAgent, expected: 'chrome' },
    { browser: 'Arc', userAgent: arcUserAgent, expected: 'chrome' },
  ];

  test.each(testCases)('should detect $browser browser', ({ userAgent, expected }) => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);

    expect(getJsonSelector()).toBe(selectors[expected]);
  });
});
