# WASMs for modern-json-formatter 

Custom json tokenizer written in GO and compiled to WASM.

## Schema

The output of the tokenizer is a schema that represents the json structure and values.

### Primitive nodes

Null node:

```js
{ type: "null" }
```

Number node:

```js
{ type: "number", value: "1" }
```

String node:

```js
{ type: "string", value: "string value" }
```

Boolean node:

```js
{ type: "bool", value: true }
```

### Object nodes

Object schema:

```js
{
  type: "object",
  properties: [
    {
      key: "key1",
      value: // inner value...
    },
    {
      key: "key2",
      value: // inner value...
    }
  ]
}
```

Array schema:

```js
{
  type: "array",
  items: [
    // inner value...
    // inner value...
    // inner value...
  ]
}
```
