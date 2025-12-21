import type { ReactiveController } from 'lit';
import type { ReactiveControllerHost } from '@lit/reactive-element/reactive-controller.js';
import { debounce } from 'es-toolkit';
import { getHistory } from '@core/background';

export class AutocompleteController implements ReactiveController {
  public options: string[] = [];

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly hostname: string,
  ) {
    host.addController(this);
  }

  public hostConnected() {
    void this.loadHistory('');
  }

  public updateHistory(prefix: string) {
    void this.loadHistory(prefix);
  }

  private readonly loadHistory = debounce(async (prefix: string) => {
    this.options = await getHistory(this.hostname, prefix);
    this.host.requestUpdate();
  }, 250);
}
