import { buildContainers } from './containers';

describe('buildContainers', () => {
  let result: ReturnType<typeof buildContainers>;
  let root: ShadowRoot;

  beforeEach(() => {
    const element = document.createElement('div');
    root = element.attachShadow({ mode: 'open' });
    result = buildContainers(root);
  });

  describe('root container', () => {
    test('should should be div element', () => {
      expect(result.rootContainer).toBeInstanceOf(HTMLDivElement);
    });

    test('should have a class name of root-container', () => {
      expect(result.rootContainer.className)
        .toEqual('root-container formatted loading');
    });

    test('should be deattached', () => {
      expect(result.rootContainer.parentElement).toBeNull();
    });
  });

  describe('format container', () => {
    test('should should be div element', () => {
      expect(result.formatContainer).toBeInstanceOf(HTMLDivElement);
    });

    test('should have a class name of formatted-json-container', () => {
      expect(result.formatContainer.className).toBe('formatted-json-container');
    });

    test('should be attached to the root container', () => {
      expect(result.formatContainer.parentElement).toBe(result.rootContainer);
    });
  });

  describe('raw container', () => {
    test('should should be div element', () => {
      expect(result.rawContainer).toBeInstanceOf(HTMLDivElement);
    });

    test('should have a class name of raw-json-container', () => {
      expect(result.rawContainer.className).toBe('raw-json-container');
    });

    test('should be attached to the root container', () => {
      expect(result.rawContainer.parentElement).toBe(result.rootContainer);
    });
  });
});
