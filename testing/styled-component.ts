import { StyledComponentElement } from '@core/dom';

export const getShadowRoot = (element: StyledComponentElement): ShadowRoot => {
   
  const root: ShadowRoot | undefined = Reflect.get(element, 'shadow') ?? element.shadowRoot;
  if (!root) {
    throw new Error('ShadowRoot is not defined');
  }

  return root;
};
