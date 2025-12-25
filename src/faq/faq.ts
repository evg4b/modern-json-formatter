import { css, html, LitElement } from 'lit';
import { provide } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import './sidebar';
import './content';

import '@core/styles/variables.scss';
import './faq.scss';
import { SidebarController, sidebarControllerContext } from './sidebar/sidebar.controller';
import { ref } from 'lit/directives/ref.js';
import { boxingFixCss } from '@core/ui/styles';

@customElement('mjf-faq-page')
export class FaqPageElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    css`
      :host {
        display: flex;
        flex-direction: row;
        gap: 10px;
      }

      mjf-sidebar {
        flex: 1 5 auto;
      }

      mjf-content {
        flex: 4 7 auto;
      }

      mjf-sidebar,
      mjf-content {
        min-height: 100vh;
        max-height: 100vh;
        overflow-y: auto;
      }
    `,
  ];

  @provide({ context: sidebarControllerContext })
  private readonly sidebarController = new SidebarController(this);

  public override render() {
    return html`
      <mjf-sidebar .items=${this.sidebarController.items}
                   .active=${this.sidebarController.active}>
      </mjf-sidebar>
      <mjf-content ${ref(this.sidebarController.contentRef)}></mjf-content>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mjf-faq-page': FaqPageElement;
  }
}
