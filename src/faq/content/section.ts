import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { sidebarControllerContext } from "../sidebar/sidebar.controller";
import { createRef, ref } from "lit/directives/ref.js";
import { SidebarController } from "../sidebar/sidebar.controller";

declare global {
  interface HTMLElementTagNameMap {
    'mjf-section': SectionElement;
  }
}

@customElement('mjf-section')
export class SectionElement extends LitElement {
  public static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }
      
    * { box-sizing: border-box; }

    //display: flex;
    //flex-direction: column;
    //padding: var(--v-padding) var(--h-padding) var(--v-padding) calc(var(--sidebar-width) + var(--h-padding));
    //gap: 25px;

    h3 {
        margin: 50px 0 20px 0;
    }

    h4.examples {
        margin: 5px 0;
        font-weight: 400;
    }

    pre {
        display: block;
        color: #a8c7fa;
        font-family: monospace;
        padding: 10px 10px;
        border-radius: 3px;
        background: #3c3c3c;
        overflow: auto;

        code {
            padding: 0;
            margin: 0;
        }
    }

    .d-print-block {
        display: flex;
        flex-direction: column;
        gap: 10px;

        table {
            width: 100%;
            text-align: left;
            background: #3c3c3c;
            padding: 10px 10px;
            border-radius: 5px;

            th,
            td {
                padding: 5px 10px;
            }

            th {
                color: #696969;
                font-weight: 400;
                user-select: none;
            }

            td.font-monospace {
                font-family: monospace;
                font-weight: 400;
                color: #a8c7fa;
            }
        }

        .pe-3 {
            width: 65px;
        }
      }
  `;

  ref = createRef<HTMLSelectElement>();

  @property()
  public content: TemplateResult<1> | null = null;

  @consume({ context: sidebarControllerContext })
  public sidebarController!: SidebarController;

  public override updated()  {
    this.sidebarController.registerSection(this.ref.value!)
  }

  public override render() {
    return html`
      <section ${ref(this.ref)}>
        ${ this.content }
      </section>
    `;
  }
}