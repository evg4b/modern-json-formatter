import { StyledComponentElement } from '@core/dom';

export const getShadowRoot = (element: StyledComponentElement): ShadowRoot => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const root: ShadowRoot | undefined = Reflect.get(element, 'shadow') ?? element.shadowRoot;
  if (!root) {
    throw new Error('ShadowRoot is not defined');
  }

  return root;
};
