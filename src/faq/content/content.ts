import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import lang from '../sections';

import './section';

declare global {
  interface HTMLElementTagNameMap {
    'mjf-content': ContentElement;
  }
}

@customElement('mjf-content')
export class ContentElement extends LitElement {
  public static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 20px;
    }
  `;

  public override render() {
    return html`
      <mjf-section .content=${lang.en.intro}></mjf-section>
      <mjf-section .content=${lang.en.basicFilters}></mjf-section>
      <mjf-section .content=${lang.en.typesAndValues}></mjf-section>
      <mjf-section .content=${lang.en.builtinOperatorsAndFunctions}></mjf-section>
      <mjf-section .content=${lang.en.conditionalsAndComparisons}></mjf-section>
      <mjf-section .content=${lang.en.regularExpressions}></mjf-section>
      <mjf-section .content=${lang.en.advancedFeatures}></mjf-section>
      <mjf-section .content=${lang.en.math}></mjf-section>
      <mjf-section .content=${lang.en.assignment}></mjf-section>
    `;
  }
}
