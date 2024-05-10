declare module '*.scss' {
  const styles: string;
  export default styles;
}

type PropertyNode = {
  key: string;
  value: ParsedJSON;
}

type ObjectNode = {
  type: 'object';
  properties: PropertyNode[];
}

type ArrayNode = {
  type: 'array';
  items: ParsedJSON[];
}

type StringNode = {
  type: 'string';
  value: string;
}

type NumberNode = {
  type: 'number';
  value: string;
}

type BooleanNode = {
  type: 'bool';
  value: boolean;
}

type NullNode = {
  type: 'null';
}

type ParsedJSON = ObjectNode | ArrayNode | StringNode | NumberNode | BooleanNode | NullNode;

interface ErrorParserResponse {
  type: 'error';
  error: string;
}

interface SuccessParserResponse {
  type: 'response';
  value: ParsedJSON;
}

type ParserResponse = ErrorParserResponse | SuccessParserResponse;

declare function parseJSON(data: string): ParserResponse;
