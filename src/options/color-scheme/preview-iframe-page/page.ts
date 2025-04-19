import { getURL } from '@core/browser';
import { createElement } from '@core/dom';
import { importStyles, registerStyles } from '@core/ui';
import { buildDom } from '../../../content-script/dom';
import { compilePreset } from '../helpres';
import { ColorScheme } from '../models';
import { previewModel } from './preview-model';

const applyRootCssVariablesTo = (element: HTMLElement | ShadowRoot, preset: ColorScheme) => {
  element.querySelector('#preview-style')?.remove();
  element.appendChild(createElement({
    element: 'style',
    id: 'preview-style',
    content: compilePreset({ light: preset }),
  }));
};

const shadowRoot = document.body.attachShadow({ mode: 'closed' });

registerStyles(shadowRoot, `:host { background-color: #282828; color: #282828; display: block; }`);
importStyles(shadowRoot, getURL('content-styles.css'));

window.addEventListener('message', function (event) {
  applyRootCssVariablesTo(shadowRoot, event.data);
});

shadowRoot.append(
  createElement({
    element: 'div',
    class: ['root-container', 'formatted'],
    children: [
      createElement({
        element: 'div',
        class: ['formatted-json-container'],
        children: [buildDom(previewModel)],
      }),
    ],
  }),
);


