import '@testing/browser.mock';
import { buildButtons } from './buttons';

describe('buildButtons', () => {
  let root: ShadowRoot;
  let result: ReturnType<typeof buildButtons>;

  beforeEach(() => {
    const element = document.createElement('div');
    root = element.attachShadow({ mode: 'open' });
    result = buildButtons(root);
  });

  test('raw button should bee defined buttons', () => {
    expect(result.rawButton).toBeDefined();
    expect(result.rawButton.tagName).toBe('BUTTON');
  });

  test('formated button should bee defined buttons', () => {
    expect(result.formatButton).toBeDefined();
    expect(result.rawButton.tagName).toBe('BUTTON');
  });

  test('formated should be active by default', () => {
    expect(result.formatButton.classList).toContain('active');
  });

  describe('clicking on raw button', () => {
    beforeEach(() => result.rawButton.click());

    test('should make raw button active', () => {
      expect(result.rawButton.classList).toContain('active');
    });

    test('should make formatted button inactive', () => {
      expect(result.formatButton.classList).not.toContain('active');
    });
  });

  describe('clicking on formated button should make it active', () => {
    beforeEach(() => {
      result.rawButton.click();
      result.formatButton.click();
    });

    test('should make formatted button active', () => {
      expect(result.formatButton.classList).toContain('active');
    });

    test('should make raw button inactive', () => {
      expect(result.rawButton.classList).not.toContain('active');
    });
  });
});
