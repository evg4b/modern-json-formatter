import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { SidebarController, sidebarControllerContext } from '../sidebar/sidebar.controller';
import { createRef, ref } from 'lit/directives/ref.js';
import { boxingFixCss, inlineCodeCss } from '@core/styles/lit';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-section': SectionElement;
  }
}

@customElement('mjf-section')
export class SectionElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    inlineCodeCss,
    css`
      :host {
        display: flex;
        flex-direction: column;
      }

      * {
        box-sizing: border-box;
      }

      h3 {
        margin: 50px 0 20px 0;
      }

      h4 {
        margin: 5px 0;
        font-weight: 400;
      }

      pre {
        display: block;
        color: var(--code-color);
        font-family: monospace;
        padding: 10px 10px;
        border-radius: 3px;
        background: var(--code-background);
        overflow: auto;

        code {
          padding: 0;
          margin: 0;
        }
      }

      mjf-example-table + mjf-example-table {
        margin-top: 10px;
      }
    `,
  ];

  ref = createRef<HTMLSelectElement>();

  @property()
  public content: TemplateResult<1> | null = null;

  @consume({ context: sidebarControllerContext })
  public sidebarController!: SidebarController;

  public override updated() {
    const section = this.ref.value;
    if (section) {
      this.sidebarController.registerSection(section);
    }
  }

  public override render() {
    return html`
      <section ${ref(this.ref)}>
        ${this.content}
      </section>
    `;
  }
}
