declare module '*.scss' {
  const styles: string;
  export default styles;
}

interface PropertyNode {
  key: string;
  value: ParsedJSON;
}

interface ObjectNode {
  type: 'object';
  properties: PropertyNode[];
}

interface ArrayNode {
  type: 'array';
  items: ParsedJSON[];
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

type ParsedJSON = ObjectNode | ArrayNode | StringNode | NumberNode | BooleanNode | NullNode;

interface ErrorNode {
  type: 'error';
  error: string;
}


type ParserResponse = ParsedJSON | ErrorNode;

declare function tokenizerJSON(data: string): ParserResponse;
