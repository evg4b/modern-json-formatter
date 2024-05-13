import { element } from './helpres';

export const buildStringNode = (object: StringNode) => {
  return element({
    content: JSON.stringify(object.value),
    class: 'string',
  });
};
