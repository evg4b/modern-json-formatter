<div align="center">
  <h1><code>worker-wasm</code></h1>

  <strong>
    The JSON core of Modern JSON Formatter, written in <a title="RUST" href="https://rust-lang.org/">🦀🕸</a> and compiled to WASM using <a href="https://github.com/rustwasm/wasm-pack">wasm-pack</a>.
  </strong>
</div>

## Exports

| Function               | Returns                                                                   |
|------------------------|---------------------------------------------------------------------------|
| `tokenize(json)`       | The node tree of the document (see the schema below)                      |
| `query(json, query)`   | A `tuple` node with every output of the jq query                          |
| `format(json)`         | The document indented with two spaces                                     |
| `minify(json)`         | The document on one line, without whitespace                              |

Every function throws an error with a message when the input cannot be parsed or the query fails.

`tokenize` keeps every duplicated key. `query`, `format` and `minify` work on jaq values, where a duplicated key keeps
only its last value.

The parser keeps numbers exactly as written and accepts comments, trailing commas, `NaN` and `Infinity`. Queries run
on [jaq](https://github.com/01mf02/jaq) with its standard library, plus `md5`, `sha256` and `sha512` on strings.

The Rust logic lives in `core/`, which has no WASM dependencies and is tested with
`cargo test --manifest-path core/Cargo.toml`. TypeScript types for the output are in `types/models.ts`.

## Schema

### Primitive nodes

Null node:

```js
{ type: "null" }
```

Number node (the value is the number as written in the source):

```js
{ type: "number", value: "18446744073709551615" }
```

String node:

```js
{ type: "string", value: "string value" }
```

A string that looks like a URL (`http://`, `https://` or `ftp://`) or an email address also carries a variant:

```js
{ type: "string", value: "https://example.com", variant: "url" }
{ type: "string", value: "user@example.com", variant: "email" }
```

Boolean node:

```js
{ type: "boolean", value: true }
```

### Object nodes

Object schema (properties keep their source order, duplicated keys included):

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

Tuple schema (returned only by `query`, one item per output of the query):

```js
{
  type: "tuple",
  items: [
    // inner value...
    // inner value...
    // inner value...
  ]
}
```
