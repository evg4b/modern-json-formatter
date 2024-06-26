export const tNull = (): NullNode => ({ type: 'null' });
export const tBool = (value: boolean): BooleanNode => ({ type: 'bool', value: value });
export const tString = (value: string): StringNode => ({ type: 'string', value: value });
export const tNumber = (value: string): NumberNode => ({ type: 'number', value: value });
export const tArray = (...items: ParsedJSON[]): ArrayNode => ({ type: 'array', items });
export const tObject = (...properties: PropertyNode[]): ObjectNode => ({ type: 'object', properties });
export const tProperty = (key: string, value: ParsedJSON): PropertyNode => ({ key, value: value });
