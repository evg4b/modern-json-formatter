import type { Args, Decorator, StoryContext } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { html, render, type TemplateResult } from 'lit';
import { styleMap, type StyleInfo } from 'lit/directives/style-map.js';

/**
 * Slotted content of the rendered element. Reserved: never assigned as a property.
 */
export type Children = string | number | Node | TemplateResult | (string | Node | TemplateResult)[];

export interface ChildrenArgs {
  children?: Children;
}

/**
 * Default render for every story (registered in `.storybook/preview.ts`).
 *
 * Creates the element named by the meta's `component`, assigns every arg as a
 * property, renders the `children` arg into its light DOM (so it lands in the
 * default slot) and forwards `parameters.events` to the Actions panel.
 * Stories with custom markup still provide their own `render`.
 */
export const renderComponent = (args: Args, { component, id, parameters }: StoryContext): HTMLElement => {
  if (typeof component !== 'string') {
    throw new TypeError(`Story ${id} has no "component" tag name and no custom render`);
  }

  const element = document.createElement(component);
  const { children, ...properties } = args as Args & ChildrenArgs;

  Object.entries(properties)
    .filter(([, value]) => value !== undefined)
    .forEach(([key, value]) => Reflect.set(element, key, value));

  if (children !== undefined) {
    render(children, element);
  }

  const events: string[] = parameters.events ?? [];
  events.forEach(event => element.addEventListener(event, action(event)));

  return element;
};

/**
 * Wraps the story in a box that also contains `position: fixed` children
 * (sticky panel, floating message): a transform makes the box their containing
 * block, so they stay inside it, also when several stories share a docs page.
 */
export const withContainer = (style: StyleInfo): Decorator => story => html`
  <div style=${styleMap({ position: 'relative', transform: 'translateZ(0)', ...style })}>${story()}</div>
`;
