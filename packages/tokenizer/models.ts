export interface PropertyNode {
  key: string;
  value: TokenNode;
}

export interface ObjectNode {
  type: 'object';
  properties: PropertyNode[];
}

export interface ArrayNode {
  type: 'array';
  items: TokenNode[];
}

export interface TupleNode {
  type: 'tuple';
  items: TokenNode[];
}

export interface StringNode {
  type: 'string';
  value: string;
}

export interface NumberNode {
  type: 'number';
  value: string;
}

export interface BooleanNode {
  type: 'bool';
  value: boolean;
}

export interface NullNode {
  type: 'null';
}

export type TokenNode = ObjectNode | ArrayNode | StringNode | NumberNode | BooleanNode | NullNode;

export interface ErrorNode {
  type: 'error';
  scope: 'jq' | 'tokenizer';
  error: string;
}

export type TokenizerResponse = TokenNode | TupleNode | ErrorNode;
