import { element } from './helpres';

export const buildBoolNode = (object: BooleanNode) => {
  return element({
    content: JSON.stringify(object.value),
    class: 'boolean',
  });
};
