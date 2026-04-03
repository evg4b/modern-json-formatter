import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { boxingFixCss } from '@core/styles/lit.ts';

/**
 * Shared styles for options section components.
 * Used by download-mode-section, toolbar-buttons-section, and other option sections.
 */
export const optionsSectionStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  h3 {
    margin: 0 0 4px 0;
    font-size: 1rem;
  }

  :host([disabled]) {
    opacity: 0.4;
    pointer-events: none;
  }

  .section-hint {
    margin: 0 0 14px 0;
    font-size: 0.82rem;
    color: var(--meta-info-color);
    line-height: 1.4;
  }

  .option-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-hint {
    font-size: 0.78rem;
    color: var(--meta-info-color);
    line-height: 1.4;
  }
`;

declare global {
  interface HTMLElementTagNameMap {
    'mjf-options-section': OptionsSectionElement;
  }
}

@customElement('mjf-options-section')
export class OptionsSectionElement extends LitElement {
  public static override readonly styles = [
    boxingFixCss,
    optionsSectionStyles,
  ];

  public override render() {
    return html`
      <h3>
        <slot name="title"></slot>
      </h3>

      <p class="section-hint">
        <slot name="hint"></slot>
      </p>
      <div>
        <slot></slot>
      </div>
    `;
  }
}
