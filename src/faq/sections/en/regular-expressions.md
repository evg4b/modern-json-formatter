## Regular expressions

jq uses the [Oniguruma regular expression library](https://github.com/kkos/oniguruma/blob/master/doc/RE), as do PHP,
TextMate, Sublime Text, etc, so the description here will focus on jq specifics.

Oniguruma supports several flavors of regular expression, so it is important to know that jq uses
the ["Perl NG" (Perl with named groups)](https://github.com/kkos/oniguruma/blob/master/doc/SYNTAX.md) flavor.

The jq regex filters are defined so that they can be used using one of these patterns:

```
STRING | FILTER(REGEX)
STRING | FILTER(REGEX; FLAGS)
STRING | FILTER([REGEX])
STRING | FILTER([REGEX, FLAGS])
```

where:

- STRING, REGEX, and FLAGS are jq strings and subject to jq string interpolation;
- REGEX, after string interpolation, should be a valid regular expression;
- FILTER is one of `test`, `match`, or `capture`, as described below.

Since REGEX must evaluate to a JSON string, some characters that are needed to form a regular expression must be
escaped. For example, the regular expression `\s` signifying a whitespace character would be written as `"\\s"`.

FLAGS is a string consisting of one of more of the supported flags:

- `g` - Global search (find all matches, not just the first)
- `i` - Case insensitive search
- `m` - Multi line mode (`.` will match newlines)
- `n` - Ignore empty matches
- `p` - Both s and m modes are enabled
- `s` - Single line mode (`^` -> `\A`, `$` -> `\Z`)
- `l` - Find longest possible matches
- `x` - Extended regex format (ignore whitespace and comments)

To match a whitespace with the `x` flag, use `\s`, e.g.

```
jq -n '"a b" | test("a\\sb"; "x")'
```

Note that certain flags may also be specified within REGEX, e.g.

```
jq -n '("test", "TEst", "teST", "TEST") | test("(?i)te(?-i)st")'
```

evaluates to: `true`, `true`, `false`, `false`.

### `test(val)`, `test(regex; flags)`

Like `match`, but does not return match objects, only `true` or `false` for whether or not the regex matches the input.

#### Examples:
<mjf-example-table query='test("foo")' input='"foo"' output="true"></mjf-example-table>
<mjf-example-table query='.[] | test("a b c # spaces are ignored"; "ix")' input='["xabcd", "ABC"]' output="true&#10;true"></mjf-example-table>

### `match(val)`, `match(regex; flags)`

**match** outputs an object for each match it finds. Matches have the following fields:

- `offset` - offset in UTF-8 codepoints from the beginning of the input
- `length` - length in UTF-8 codepoints of the match
- `string` - the string that it matched
- `captures` - an array of objects representing capturing groups.

Capturing group objects have the following fields:

- `offset` - offset in UTF-8 codepoints from the beginning of the input
- `length` - length in UTF-8 codepoints of this capturing group
- `string` - the string that was captured
- `name` - the name of the capturing group (or `null` if it was unnamed)

Capturing groups that did not match anything return an offset of -1

#### Examples:
<mjf-example-table query='match("(abc)+"; "g")' input='"abc abc"' output='{"offset": 0, "length": 3, "string": "abc", "captures": [{"offset": 0, "length": 3, "string": "abc", "name": null}]}&#10;{"offset": 4, "length": 3, "string": "abc", "captures": [{"offset": 4, "length": 3, "string": "abc", "name": null}]}'></mjf-example-table>
<mjf-example-table query='match("foo")' input='"foo bar foo"' output='{"offset": 0, "length": 3, "string": "foo", "captures": []}'></mjf-example-table>
<mjf-example-table query='match(["foo", "ig"])' input='"foo bar FOO"' output='{"offset": 0, "length": 3, "string": "foo", "captures": []}&#10;{"offset": 8, "length": 3, "string": "FOO", "captures": []}'></mjf-example-table>
<mjf-example-table query='match("foo (?&lt;bar123&gt;bar)? foo"; "ig")' input='"foo bar foo foo foo"' output='{"offset": 0, "length": 11, "string": "foo bar foo", "captures": [{"offset": 4, "length": 3, "string": "bar", "name": "bar123"}]}&#10;{"offset": 12, "length": 8, "string": "foo foo", "captures": [{"offset": -1, "length": 0, "string": null, "name": "bar123"}]}'></mjf-example-table>
<mjf-example-table query='[ match("."; "g")] | length' input='"abc"' output="3"></mjf-example-table>

### `capture(val)`, `capture(regex; flags)`

Collects the named captures in a JSON object, with the name of each capture as the key, and the matched string as the
corresponding value.

#### Examples:
<mjf-example-table query='capture("(?&lt;a&gt;[a-z]+)-(?&lt;n&gt;[0-9]+)")' input='"xyzzy-14"' output='{ "a": "xyzzy", "n": "14" }'></mjf-example-table>

### `scan(regex)`, `scan(regex; flags)`

Emit a stream of the non-overlapping substrings of the input that match the regex in accordance with the flags, if any
have been specified. If there is no match, the stream is empty. To capture all the matches for each input string, use
the idiom `[ expr ]`, e.g. `[ scan(regex) ]`.

#### Examples:
<mjf-example-table query='scan("c")' input='"abcdefabc"' output='"c"&#10;"c"'></mjf-example-table>

### `split(regex; flags)`

Splits an input string on each regex match.

For backwards compatibility, when called with a single argument, `split` splits on a string, not a regex.

#### Examples:
<mjf-example-table query='split(", *"; null)' input='"ab,cd, ef"' output='["ab","cd","ef"]'></mjf-example-table>

### `splits(regex)`, `splits(regex; flags)`

These provide the same results as their `split` counterparts, but as a stream instead of an array.

#### Examples:
<mjf-example-table query='splits(", *")' input='"ab,cd, ef, gh"' output='"ab"&#10;"cd"&#10;"ef"&#10;"gh"'></mjf-example-table>

### `sub(regex; tostring)`, `sub(regex; tostring; flags)`

Emit the string obtained by replacing the first match of regex in the input string with `tostring`, after interpolation.
`tostring` should be a jq string or a stream of such strings, each of which may contain references to named captures.
The named captures are, in effect, presented as a JSON object (as constructed by `capture`) to `tostring`, so a
reference to a captured variable named "x" would take the form: `"\(.x)"`.

#### Examples:
<mjf-example-table query='sub("[^a-z]*(?&lt;x&gt;[a-z]+)"; "Z\(.x)"; "g")' input='"123abc456def"' output='"ZabcZdef"'></mjf-example-table>
<mjf-example-table query='[sub("(?&lt;a&gt;.)"; "\(.a|ascii_upcase)", "\(.a|ascii_downcase)")]' input='"aB"' output='["AB","aB"]'></mjf-example-table>

### `gsub(regex; tostring)`, `gsub(regex; tostring; flags)`

`gsub` is like `sub` but all the non-overlapping occurrences of the regex are replaced by `tostring`, after
interpolation. If the second argument is a stream of jq strings, then `gsub` will produce a corresponding stream of JSON
strings.

#### Examples:
<mjf-example-table query='gsub("(?&lt;x&gt;.)[^a]*"; "+\(.x)-")' input='"Abcabc"' output='"+A-+a-"'></mjf-example-table>
<mjf-example-table query='[gsub("p"; "a", "b")]' input='"p"' output='["a","b"]'></mjf-example-table>
