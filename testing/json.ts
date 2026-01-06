import type {
  ArrayNode,
  BooleanNode,
  ErrorNode,
  NullNode,
  NumberNode,
  ObjectNode,
  PropertyNode,
  StringNode,
  StringNodeType,
  TokenNode,
} from '@wasm/types';

export const tNull = (): NullNode => ({ type: 'null' });
export const tBool = (value: boolean): BooleanNode => ({
  type: 'boolean',
  value,
});
export const tString = (value: string, variant?: StringNodeType): StringNode => ({
  type: 'string',
  value,
  variant,
});
export const tNumber = (value: string): NumberNode => ({
  type: 'number',
  value,
});
export const tArray = (...items: TokenNode[]): ArrayNode => ({
  type: 'array',
  items,
});
export const tObject = (...properties: PropertyNode[]): ObjectNode => ({
  type: 'object',
  properties,
});
export const tProperty = (key: string, value: TokenNode): PropertyNode => ({
  key,
  value,
});
export const tErrorNode = (error: string, scope?: ErrorNode['scope']): ErrorNode => ({
  type: 'error',
  error,
  scope: scope ?? 'worker',
});
export const tTuple = (...items: TokenNode[]) => ({
  type: 'tuple',
  items,
});
