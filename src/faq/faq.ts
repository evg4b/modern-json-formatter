import { html, css, LitElement } from 'lit';
import { provide } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import './sidebar';
import './content';

import '../core/styles/variables.css';
import './faq.css';
import { sidebarControllerContext } from './sidebar/sidebar.controller.ts';
import { SidebarController } from './sidebar/sidebar.controller.ts';
import { ref } from 'lit/directives/ref.js';

@customElement('mjf-faq-page')
export class FaqPageElement extends LitElement {
  public static override styles = css`
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
  `;

  @provide({ context: sidebarControllerContext })
  private readonly sidebarController = new SidebarController(this);

  public override render() {
    return html`
      <mjf-sidebar .items=${this.sidebarController.items}
                   .activeItem=${this.sidebarController.activeItem}>
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
