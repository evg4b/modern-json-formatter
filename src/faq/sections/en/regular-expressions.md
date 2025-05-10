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

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example85" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">test("foo")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"foo"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">true</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.[] | test("a b c # spaces are ignored"; "ix")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">["xabcd", "ABC"]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">true</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">true</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

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

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example86" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">match("(abc)+"; "g")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"abc abc"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">
          {"offset": 0, "length": 3, "string": "abc", "captures": [{"offset": 0, "length": 3,
          "string":
          "abc", "name": null}]}
        </td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">
          {"offset": 4, "length": 3, "string": "abc", "captures": [{"offset": 4, "length": 3,
          "string":
          "abc", "name": null}]}
        </td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">match("foo")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"foo bar foo"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"offset": 0, "length": 3, "string": "foo", "captures": []}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">match(["foo", "ig"])</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"foo bar FOO"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"offset": 0, "length": 3, "string": "foo", "captures": []}</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">{"offset": 8, "length": 3, "string": "FOO", "captures": []}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">match("foo (?&lt;bar123&gt;bar)? foo"; "ig")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"foo bar foo foo foo"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">
          {"offset": 0, "length": 11, "string": "foo bar foo", "captures": [{"offset": 4,
          "length": 3,
          "string": "bar", "name": "bar123"}]}
        </td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">
          {"offset": 12, "length": 8, "string": "foo foo", "captures": [{"offset": -1, "length":
          0,
          "string": null, "name": "bar123"}]}
        </td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">[ match("."; "g")] | length</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"abc"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">3</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `capture(val)`, `capture(regex; flags)`

Collects the named captures in a JSON object, with the name of each capture as the key, and the matched string as the
corresponding value.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example87" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">capture("(?&lt;a&gt;[a-z]+)-(?&lt;n&gt;[0-9]+)")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"xyzzy-14"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{ "a": "xyzzy", "n": "14" }</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `scan(regex)`, `scan(regex; flags)`

Emit a stream of the non-overlapping substrings of the input that match the regex in accordance with the flags, if any
have been specified. If there is no match, the stream is empty. To capture all the matches for each input string, use
the idiom `[ expr ]`, e.g. `[ scan(regex) ]`.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example88" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">scan("c")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"abcdefabc"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">"c"</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">"c"</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `split(regex; flags)`

Splits an input string on each regex match.

For backwards compatibility, when called with a single argument, `split` splits on a string, not a regex.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example89" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">split(", *"; null)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"ab,cd, ef"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">["ab","cd","ef"]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `splits(regex)`, `splits(regex; flags)`

These provide the same results as their `split` counterparts, but as a stream instead of an array.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example90" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">splits(", *")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"ab,cd, ef, gh"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">"ab"</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">"cd"</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">"ef"</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">"gh"</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `sub(regex; tostring)`, `sub(regex; tostring; flags)`

Emit the string obtained by replacing the first match of regex in the input string with `tostring`, after interpolation.
`tostring` should be a jq string or a stream of such strings, each of which may contain references to named captures.
The named captures are, in effect, presented as a JSON object (as constructed by `capture`) to `tostring`, so a
reference to a captured variable named "x" would take the form: `"\(.x)"`.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example91" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">sub("[^a-z]*(?&lt;x&gt;[a-z]+)"; "Z\(.x)"; "g")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"123abc456def"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">"ZabcZdef"</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">[sub("(?&lt;a&gt;.)"; "\(.a|ascii_upcase)",
          "\(.a|ascii_downcase)")]
        </td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"aB"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">["AB","aB"]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `gsub(regex; tostring)`, `gsub(regex; tostring; flags)`

`gsub` is like `sub` but all the non-overlapping occurrences of the regex are replaced by `tostring`, after
interpolation. If the second argument is a stream of jq strings, then `gsub` will produce a corresponding stream of JSON
strings.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example92" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">gsub("(?&lt;x&gt;.)[^a]*"; "+\(.x)-")</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"Abcabc"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">"+A-+a-"</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">[gsub("p"; "a", "b")]</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"p"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">["a","b"]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>
