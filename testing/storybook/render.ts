import type { Args, Decorator, StoryContext } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { html, render, type TemplateResult } from 'lit';
import { styleMap, type StyleInfo } from 'lit/directives/style-map.js';

export type Children = string | number | Node | TemplateResult | (string | Node | TemplateResult)[];

export interface ChildrenArgs {
  children?: Children;
}

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

export const withContainer = (style: StyleInfo): Decorator => story => html`
  <div style=${styleMap({ position: 'relative', transform: 'translateZ(0)', ...style })}>${story()}</div>
`;
