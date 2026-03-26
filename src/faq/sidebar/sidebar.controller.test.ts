import { afterEach, beforeEach, describe, expect, rstest, test } from '@rstest/core';
import { SidebarController } from './sidebar.controller';
import type { ReactiveControllerHost } from '@lit/reactive-element/reactive-controller.js';

const makeHost = (): ReactiveControllerHost => ({
  addController: rstest.fn(),
  requestUpdate: rstest.fn(),
  updateComplete: Promise.resolve(true),
});

const makeSection = (id: string): HTMLSelectElement => {
  const section = document.createElement('section') as unknown as HTMLSelectElement;
  const h2 = document.createElement('h2');
  h2.id = id;
  h2.textContent = id;
  section.appendChild(h2);
  return section;
};

describe('SidebarController', () => {
  let controller: SidebarController;
  let host: ReactiveControllerHost;

  beforeEach(() => {
    host = makeHost();
    controller = new SidebarController(host);
  });

  test('constructor registers itself with the host', () => {
    expect(host.addController).toHaveBeenCalledWith(controller);
  });

  test('items is empty initially', () => {
    expect(controller.items).toEqual([]);
  });

  test('registerSection adds item and requests update', () => {
    controller.registerSection(makeSection('intro'));

    expect(controller.items).toHaveLength(1);
    expect(controller.items[0].id).toBe('intro');
    expect(host.requestUpdate).toHaveBeenCalled();
  });

  test('registerSection skips sections without h2', () => {
    const empty = document.createElement('section') as unknown as HTMLSelectElement;
    controller.registerSection(empty);

    expect(controller.items).toHaveLength(0);
  });

  describe('scrollEndHandler', () => {
    beforeEach(() => {
      rstest.useFakeTimers();
    });

    afterEach(() => {
      rstest.useRealTimers();
    });

    test('sets active to the closest visible item', () => {
      const section = makeSection('getting-started');
      controller.registerSection(section);

      controller.contentRef(document.createElement('div'));
      rstest.runAllTimers();

      expect(controller.active).toBe('getting-started');
    });

    test('skips items whose top is outside the viewport', () => {
      const section = makeSection('far-below');
      const h2 = section.querySelector('h2')!;
      rstest.spyOn(h2, 'getBoundingClientRect').mockReturnValue({
        top: globalThis.innerHeight + 100,
        left: 0, right: 0, bottom: 0, width: 0, height: 0,
        toJSON: () => ({}),
      } as DOMRect);
      controller.registerSection(section);

      controller.contentRef(document.createElement('div'));
      rstest.runAllTimers();

      expect(controller.active).toBeNull();
    });
  });
});
