import { beforeEach, describe, type Mock, rstest, test, expect, afterEach } from '@rstest/core';
import { AutocompleteController } from './autocomplete.controller';
import { getHistory } from '@core/background';
import type { ReactiveControllerHost } from '@lit/reactive-element/reactive-controller.js';

rstest.mock('@core/background', () => ({
  getHistory: rstest.fn(),
}));

describe('AutocompleteController with real debounce', () => {
  let host: ReactiveControllerHost;
  let controller: AutocompleteController;

  beforeEach(() => {
    rstest.useFakeTimers(); // используем fake timers
    host = {
      addController: rstest.fn(),
      requestUpdate: rstest.fn(),
      updateComplete: Promise.resolve(true),
      removeController: rstest.fn(),
    };

    controller = new AutocompleteController(host, 'example.com');
  });

  afterEach(() => {
    rstest.runOnlyPendingTimers();
    rstest.useRealTimers();
    rstest.clearAllMocks();
  });

  test('adds itself to host on construction', () => {
    expect(host.addController).toHaveBeenCalledWith(controller);
  });

  test('hostConnected calls loadHistory with empty string after debounce', async () => {
    (getHistory as Mock).mockResolvedValue(['one', 'two']);

    controller.hostConnected();

    expect(getHistory).not.toHaveBeenCalled();

    rstest.advanceTimersByTime(250);

    await Promise.resolve();

    expect(getHistory).toHaveBeenCalledWith('example.com', '');
    expect(controller.options).toEqual(['one', 'two']);
    expect(host.requestUpdate).toHaveBeenCalled();
  });

  test('updateHistory calls loadHistory with prefix after debounce', async () => {
    (getHistory as Mock).mockResolvedValue(['prefixed']);

    controller.updateHistory('pre');

    expect(getHistory).not.toHaveBeenCalled();

    rstest.advanceTimersByTime(250);
    await Promise.resolve();

    expect(getHistory).toHaveBeenCalledWith('example.com', 'pre');
    expect(controller.options).toEqual(['prefixed']);
    expect(host.requestUpdate).toHaveBeenCalled();
  });
});
