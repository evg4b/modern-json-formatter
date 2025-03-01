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
    it('should should be div element', () => {
      expect(result.rootContainer).toBeInstanceOf(HTMLDivElement);
    });

    it('should have a class name of root-container', () => {
      expect(result.rootContainer.className)
        .toEqual('root-container formatted loading');
    });

    it('should be deattached', () => {
      expect(result.rootContainer.parentElement).toBeNull();
    });
  });

  describe('format container', () => {
    it('should should be div element', () => {
      expect(result.formatContainer).toBeInstanceOf(HTMLDivElement);
    });

    it('should have a class name of formatted-json-container', () => {
      expect(result.formatContainer.className).toBe('formatted-json-container');
    });

    it('should be attached to the root container', () => {
      expect(result.formatContainer.parentElement).toBe(result.rootContainer);
    });
  });

  describe('raw container', () => {
    it('should should be div element', () => {
      expect(result.rawContainer).toBeInstanceOf(HTMLDivElement);
    });

    it('should have a class name of raw-json-container', () => {
      expect(result.rawContainer.className).toBe('raw-json-container');
    });

    it('should be attached to the root container', () => {
      expect(result.rawContainer.parentElement).toBe(result.rootContainer);
    });
  });
});
