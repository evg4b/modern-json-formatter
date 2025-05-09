## Builtin operators and functions

Some jq operators (for instance, `+`) do different things depending on the type of their arguments (arrays, numbers,
etc.). However, jq never does implicit type conversions. If you try to add a string to an object you'll get an error
message and no result.

Please note that all numbers are converted to IEEE754 double precision floating point representation. Arithmetic and
logical operators are working with these converted doubles. Results of all such operations are also limited to the
double precision.

The only exception to this behaviour of number is a snapshot of original number literal. When a number which originally
was provided as a literal is never mutated until the end of the program then it is printed to the output in its original
literal form. This also includes cases when the original literal would be truncated when converted to the IEEE754 double
precision floating point number.

### Addition: `+`

The operator `+` takes two filters, applies them both to the same input, and adds the results together. What "adding"
means depends on the types involved:

- **Numbers** are added by normal arithmetic.
- **Arrays** are added by being concatenated into a larger array.
- **Strings** are added by being joined into a larger string.
- **Objects** are added by merging, that is, inserting all the key-value pairs from both objects into a single combined
  object. If both objects contain a value for the same key, the object on the right of the `+` wins. (For recursive
  merge use the `*` operator.)

`null` can be added to any value, and returns the other value unchanged.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example13" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.a + 1</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a": 7}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">8</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.a + .b</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a": [1,2], "b": [3,4]}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[1,2,3,4]</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.a + null</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a": 1}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">1</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.a + 1</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">1</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">{a: 1} + {b: 2} + {c: 3} + {a: 42}</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">null</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"a": 42, "b": 2, "c": 3}</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### Subtraction: `-`

As well as normal arithmetic subtraction on numbers, the `-` operator can be used on arrays to remove all occurrences of
the second array's elements from the first array.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example14" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">4 - .a</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a":3}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">1</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">. - ["xml", "yaml"]</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">["xml", "yaml", "json"]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">["json"]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### Multiplication, division, modulo: `*`, `/`, `%`

These infix operators behave as expected when given two numbers. Division by zero raises an error. `x % y` computes x
modulo y.

Multiplying a string by a number produces the concatenation of that string that many times. `"x" * 0` produces `""`.

Dividing a string by another splits the first using the second as separators.

Multiplying two objects will merge them recursively: this works like addition but if both objects contain a value for
the same key, and the values are objects, the two are merged with the same strategy.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example15" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">10 / . * 3</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">5</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">6</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">. / ", "</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"a, b,c,d, e"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">["a","b,c,d","e"]</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">{"k": {"a": 1, "b": 2}} * {"k": {"a": 0,"c": 3}}</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">null</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"k": {"a": 0, "b": 2, "c": 3}}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.[] | (1 / .)?</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[1,0,-1]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">1</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">-1</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `abs`

The builtin function `abs` is defined naively as: `if . &lt; 0 then - . else . end`.

For numeric input, this is the absolute value. See the section on the identity filter for the implications of this
definition for numeric input.

To compute the absolute value of a number as a floating point number, you may wish use `fabs`.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example16" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map(abs)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[-10, -1.1, -1e-1]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[10,1.1,1e-1]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `length`

The builtin function `length` gets the length of various different types of value:

- The length of a **string** is the number of Unicode codepoints it contains (which will be the same as its JSON-encoded
  length in bytes if it's pure ASCII).
- The length of a **number** is its absolute value.
- The length of an **array** is the number of elements.
- The length of an **object** is the number of key-value pairs.
- The length of **null** is zero.
- It is an error to use `length` on a **boolean**.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example17" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.[] | length</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[[1,2], "string", {"a":2}, null, -5]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">2</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">6</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">1</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">0</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">5</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `utf8bytelength`

The builtin function `utf8bytelength` outputs the number of bytes used to encode a string in UTF-8.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example18" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">utf8bytelength</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"\u03bc"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">2</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `keys`, `keys_unsorted`

The builtin function `keys`, when given an object, returns its keys in an array.

The keys are sorted "alphabetically", by unicode codepoint order. This is not an order that makes particular sense in
any particular language, but you can count on it being the same for any two objects with the same set of keys,
regardless of locale settings.

When `keys` is given an array, it returns the valid indices for that array: the integers from 0 to length-1.

The `keys_unsorted` function is just like `keys`, but if the input is an object then the keys will not be sorted,
instead the keys will roughly be in insertion order.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example19" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">keys</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"abc": 1, "abcd": 2, "Foo": 3}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">["Foo", "abc", "abcd"]</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">keys</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[42,3,35]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[0,1,2]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `has(key)`

The builtin function `has` returns whether the input object has the given key, or the input array has an element at the
given index.

`has($key)` has the same effect as checking whether `$key` is a member of the array returned by `keys`, although `has`
will be faster.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example20" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map(has("foo"))</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[{"foo": 42}, {}]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[true, false]</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map(has(2))</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[[0,1], ["a","b","c"]]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[false, true]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>


### `in`

The builtin function `in` returns whether or not the input key is in the given object, or the input index corresponds to an element in the given array. It is, essentially, an inversed version of `has`.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example21" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.[] | in({"foo": 42})</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">["foo", "bar"]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">true</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">false</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map(in([0,1]))</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[2, 0]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[false, true]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `map(f)`, `map_values(f)`

For any filter `f`, `map(f)` and `map_values(f)` apply `f` to each of the values in the input array or object, that is, to the values of `.[]`.

In the absence of errors, `map(f)` always outputs an array whereas `map_values(f)` outputs an array if given an array, or an object if given an object.

When the input to `map_values(f)` is an object, the output object has the same keys as the input object except for those keys whose values when piped to `f` produce no values at all.

The key difference between `map(f)` and `map_values(f)` is that the former simply forms an array from all the values of `($x|f)` for each value, $x, in the input array or object, but `map_values(f)` only uses `first($x|f)`.

Specifically, for object inputs, `map_values(f)` constructs the output object by examining in turn the value of `first(.[$k]|f)` for each key, $k, of the input. If this expression produces no values, then the corresponding key will be dropped; otherwise, the output object will have that value at the key, $k.

Here are some examples to clarify the behavior of `map` and `map_values` when applied to arrays. These examples assume the input is `[1]` in all cases:

```
map(.+1)          #=>  [2]
map(., .)         #=>  [1,1]
map(empty)        #=>  []map_values(.+1)   #=>  [2]
map_values(., .)  #=>  [1]
map_values(empty) #=>  []
```

`map(f)` is equivalent to `[.[] | f]` and `map_values(f)` is equivalent to `.[] |= f`.

In fact, these are their implementations.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example22" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map(.+1)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[1,2,3]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[2,3,4]</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map_values(.+1)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a": 1, "b": 2, "c": 3}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"a": 2, "b": 3, "c": 4}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map(., .)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[1,2]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[1,1,2,2]</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map_values(. // empty)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a": null, "b": true, "c": false}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"b":true}</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `pick(pathexps)`

Emit the projection of the input object or array defined by the specified sequence of path expressions, such that if `p` is any one of these specifications, then `(. | p)` will evaluate to the same value as `(. | pick(pathexps) | p)`. For arrays, negative indices and `.[m:n]` specifications should not be used.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example23" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">pick(.a, .b.c, .x)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a": 1, "b": {"c": 2, "d": 3}, "e": 4}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"a":1,"b":{"c":2},"x":null}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">pick(.[2], .[0], .[0])</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[1,2,3,4]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[1,null,3]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### `path(path_expression)`

Outputs array representations of the given path expression in `.`. The outputs are arrays of strings (object keys) and/or numbers (array indices).

Path expressions are jq expressions like `.a`, but also `.[]`. There are two types of path expressions: ones that can match exactly, and ones that cannot. For example, `.a.b.c` is an exact match path expression, while `.a[].b` is not.

`path(exact_path_expression)` will produce the array representation of the path expression even if it does not exist in `.`, if `.` is `null` or an array or an object.

`path(pattern)` will produce array representations of the paths matching `pattern` if the paths exist in `.`.

Note that the path expressions are not different from normal expressions. The expression `path(..|select(type=="boolean"))` outputs all the paths to boolean values in `.`, and only those paths.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example24" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">path(.a[0].b)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">null</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">["a",0,"b"]</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">[path(..)]</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a":[{"b":1}]}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[[],["a"],["a",0],["a",0,"b"]]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>


### `del(path_expression)`

The builtin function `del` removes a key and its corresponding value from an object.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example25" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">del(.foo)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"foo": 42, "bar": 9001, "baz": 42}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"bar": 9001, "baz": 42}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">del(.[1, 2])</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">["foo", "bar", "baz"]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">["foo"]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>
