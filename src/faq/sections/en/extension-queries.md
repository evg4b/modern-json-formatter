## Queries in this extension

Queries run on [jaq](https://github.com/01mf02/jaq), which follows jq closely. This manual describes how it behaves
here. The main differences from the `jq` command-line tool are:

- Integers are exact at any size, so `9007199254740993 + 1` gives `9007199254740994`. Numbers with a fraction or an
  exponent become IEEE 754 doubles once arithmetic touches them. Division and most math functions return doubles,
  which print with a fraction, as in `10 / 2` → `5.0`. A number that is only passed through keeps the exact text it
  was written with.
- Assignments and `setpath` cannot create values inside `null`. `null | .a = 1` and `{} | .a.b = 1` are errors, while
  `{} | .a = 1` works. Assigning past the end of an array is an error too.
- Deleting a key with `del`, `delpaths` or `|= empty` can move the last key of that object into the freed position. Use
  `with_entries(select(.key != "name"))` when the order of the remaining keys matters.
- A duplicated key in the document keeps only its last value inside queries. The formatted view still shows every
  key.
- There is no input or environment to read: `input`, `inputs`, `$ENV`, `env`, `$__loc__` and `input_filename` are not
  available, and `now`, `halt` and `halt_error` stop the query with an error. Time functions use UTC.
- Some jq features are missing: the `?//` destructuring alternative, `@csv`, `@tsv`, `@base32`, `@base32d`,
  `builtins`, `tostream`, `fromstream`, `truncate_stream`, `ascii`, the SQL-style `INDEX` and `IN`, and modules
  (`import`, `include`).
- Regular expressions use Rust syntax rather than Oniguruma. See the regular expressions section.
- The extension adds `md5`, `sha256` and `sha512` (see the hashing section), and jaq provides `@htmld`, the inverse of
  `@html`, and `@urid`, the inverse of `@uri`.

Successful queries are saved in the history of the current site and offered as suggestions while you type.
