declare module '*.scss' {
  const styles: string;
  export default styles;
}

type ObjectNode = {
  type: 'object';
  properties: Record<string, ParsedJSON>;
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
  value: number;
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
  type: 'success';
  value: ParsedJSON;
}

type ParserResponse = ErrorParserResponse | SuccessParserResponse;

declare function parseJSON(data: string): ParserResponse;
