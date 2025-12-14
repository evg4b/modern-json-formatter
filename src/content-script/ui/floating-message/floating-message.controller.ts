import type { ReactiveController, ReactiveControllerHost } from "lit";

interface FloatingMessageControllerHost extends ReactiveControllerHost {
  remove(): void;
}

export class FloatingMessageController implements ReactiveController {
  private readonly showTimeout = 100;
  private readonly hideTimeout = 10_000;
  private readonly removeTimeout = 250;

  private readonly host: FloatingMessageControllerHost;

  constructor(host: FloatingMessageControllerHost) {
    this.host = host;
    host.addController(this);
  }

  public visible = false;

  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private removeTimer?: ReturnType<typeof setTimeout>;

  public hostConnected() {
    this.showTimer = setTimeout(() => this.onShow(), this.showTimeout);
  }

  public hostDisconnected() {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    clearTimeout(this.removeTimer);
  }

  public close() {
    this.onHide();
  }

  private onShow() {
    this.visible = true;
    this.hideTimer = setTimeout(() => this.onHide(), this.hideTimeout);
    this.host.requestUpdate();
  }

  private onHide() {
    this.visible = false;
    this.removeTimer = setTimeout(() => this.host.remove(), this.removeTimeout);
    this.host.requestUpdate();
  }
}