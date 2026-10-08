import type { Args, Decorator, StoryContext } from 'storybook-web-components-rsbuild';
import { action } from 'storybook/actions';
import { html, render, type TemplateResult } from 'lit';
import { styleMap, type StyleInfo } from 'lit/directives/style-map.js';

export type Children = string | number | Node | TemplateResult | (string | Node | TemplateResult)[];

export interface ChildrenArgs {
  children?: Children;
}

const isWritable = (target: object, key: string): boolean => {
  for (let proto: object | null = target; proto; proto = Object.getPrototypeOf(proto)) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor) {
      return descriptor.writable === true || descriptor.set !== undefined;
    }
  }

  return true;
};

export const renderComponent = (args: Args, { component, id, parameters }: StoryContext): HTMLElement => {
  if (typeof component !== 'string') {
    throw new TypeError(`Story ${id} has no "component" tag name and no custom render`);
  }

  const element = document.createElement(component);
  const { children, ...properties } = args as Args & ChildrenArgs;

  Object.entries(properties)
    .filter(([, value]) => value !== undefined)
    .forEach(([key, value]) => {
      if (!isWritable(element, key)) {
        throw new TypeError(`Story ${id}: arg "${key}" is a read-only property of <${component}>; rename it or use a custom render`);
      }

      Reflect.set(element, key, value);
    });

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
