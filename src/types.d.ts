declare module '*.scss' {
  const styles: string;
  export default styles;
}

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
  error: string;
}


type TokenizerResponse = TokenNode | ErrorNode;

declare function tokenizerJSON(data: string): TokenizerResponse;
