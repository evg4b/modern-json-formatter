interface PropertyNode {
  key: string;
  value: TokenNode;
}

interface ObjectNode {
  type: 'object';
  properties: PropertyNode[];
}

interface ArrayNode {
  type: 'array';
  items: TokenNode[];
}

interface TupleNode {
  type: 'tuple';
  items: TokenNode[];
}

interface StringNode {
  type: 'string';
  value: string;
}

interface NumberNode {
  type: 'number';
  value: string;
}

interface BooleanNode {
  type: 'bool';
  value: boolean;
}

interface NullNode {
  type: 'null';
}

type TokenNode = ObjectNode | ArrayNode | StringNode | NumberNode | BooleanNode | NullNode;

interface ErrorNode {
  type: 'error';
  scope: 'jq' | 'tokenizer';
  error: string;
}

type TokenizerResponse = TokenNode | TupleNode | ErrorNode;

declare function ___tokenizeJSON(data: string): TokenizerResponse;
