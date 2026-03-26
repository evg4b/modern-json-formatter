## Advanced features

Variables are an absolute necessity in most programming languages, but they're relegated to an "advanced feature" in jq.

In most languages, variables are the only means of passing around data. If you calculate a value, and you want to use it
more than once, you'll need to store it in a variable. To pass a value to another part of the program, you'll need that
part of the program to define a variable (as a function parameter, object member, or whatever) in which to place the
data.

It is also possible to define functions in jq, although this is a feature whose biggest use is defining jq's standard
library (many jq functions such as `map` and `select` are in fact written in jq).

jq has reduction operators, which are very powerful but a bit tricky. Again, these are mostly used internally, to define
some useful bits of jq's standard library.

It may not be obvious at first, but jq is all about generators (yes, as often found in other languages). Some utilities
are provided to help deal with generators.

Some minimal I/O support (besides reading JSON from standard input, and writing JSON to standard output) is available.

Finally, there is a module/library system.

### Variable / Symbolic Binding Operator: `... as $identifier | ...`

In jq, all filters have an input and an output, so manual plumbing is not necessary to pass a value from one part of a
program to the next. Many expressions, for instance `a + b`, pass their input to two distinct subexpressions (here `a`
and `b` are both passed the same input), so variables aren't usually necessary in order to use a value twice.

For instance, calculating the average value of an array of numbers requires a few variables in most languages - at least
one to hold the array, perhaps one for each element or for a loop counter. In jq, it's simply `add / length` - the `add`
expression is given the array and produces its sum, and the `length` expression is given the array and produces its
length.

So, there's generally a cleaner way to solve most problems in jq than defining variables. Still, sometimes they do make
things easier, so jq lets you define variables using `expression as $variable`. All variable names start with `$`.
Here's a slightly uglier version of the array-averaging example:

```
length as $array_length | add / $array_length
```

We'll need a more complicated problem to find a situation where using variables actually makes our lives easier.

Suppose we have an array of blog posts, with "author" and "title" fields, and another object which is used to map author
usernames to real names. Our input looks like:

```
{"posts": [{"title": "First post", "author": "anon"},
           {"title": "A well-written article", "author": "person1"}],
 "realnames": {"anon": "Anonymous Coward",
               "person1": "Person McPherson"}}
```

We want to produce the posts with the author field containing a real name, as in:

```
{"title": "First post", "author": "Anonymous Coward"}
{"title": "A well-written article", "author": "Person McPherson"}
```

We use a variable, $names, to store the realnames object, so that we can refer to it later when looking up author
usernames:

```
.realnames as $names | .posts[] | {title, author: $names[.author]}
```

The expression `exp as $x | ...` means: for each value of expression `exp`, run the rest of the pipeline with the entire
original input, and with `$x` set to that value. Thus `as` functions as something of a foreach loop.

Just as `{foo}` is a handy way of writing `{foo: .foo}`, so `{$foo}` is a handy way of writing `{foo: $foo}`.

Multiple variables may be declared using a single `as` expression by providing a pattern that matches the structure of
the input (this is known as "destructuring"):

```
. as {realnames: $names, posts: [$first, $second]} | ...
```

The variable declarations in array patterns (e.g., `. as [$first, $second]`) bind to the elements of the array in from
the element at index zero on up, in order. When there is no value at the index for an array pattern element, `null` is
bound to that variable.

Variables are scoped over the rest of the expression that defines them, so

```
.realnames as $names | (.posts[] | {title, author: $names[.author]})
```

will work, but

```
(.realnames as $names | .posts[]) | {title, author: $names[.author]}
```

won't.

For programming language theorists, it's more accurate to say that jq variables are lexically-scoped bindings. In
particular there's no way to change the value of a binding; one can only setup a new binding with the same name, but
which will not be visible where the old one was.

#### Examples:
<mjf-example-table query=".bar as $x | .foo | . + $x" input='{"foo":10, "bar":200}' output="210"></mjf-example-table>
<mjf-example-table query=". as $i|[(.*2|. as $i| $i), $i]" input='5' output="[10,5]"></mjf-example-table>
<mjf-example-table query=". as [$a, $b, {c: $c}] | $a + $b + $c" input='[2, 3, {"c": 4, "d": 5}]' output="9"></mjf-example-table>
<mjf-example-table query=".[] as [$a, $b] | {a: $a, b: $b}" input='[[0], [0, 1], [2, 1, 0]]' output="{&quot;a&quot;:0,&quot;b&quot;:null}&#10;{&quot;a&quot;:0,&quot;b&quot;:1}&#10;{&quot;a&quot;:2,&quot;b&quot;:1}"></mjf-example-table>

### Destructuring Alternative Operator: `?//`

The destructuring alternative operator provides a concise mechanism for destructuring an input that can take one of
several forms.

Suppose we have an API that returns a list of resources and events associated with them, and we want to get the user_id
and timestamp of the first event for each resource. The API (having been clumsily converted from XML) will only wrap the
events in an array if the resource has multiple events:

```
{"resources": [{"id": 1, "kind": "widget", "events": {"action": "create", "user_id": 1, "ts": 13}},
               {"id": 2, "kind": "widget", "events": [{"action": "create", "user_id": 1, "ts": 14}, {"action": "destroy", "user_id": 1, "ts": 15}]}]}
```

We can use the destructuring alternative operator to handle this structural change simply:

```
.resources[] as {$id, $kind, events: {$user_id, $ts}} ?// {$id, $kind, events: [{$user_id, $ts}]} | {$user_id, $kind, $id, $ts}
```

Or, if we aren't sure if the input is an array of values or an object:

```
.[] as [$id, $kind, $user_id, $ts] ?// {$id, $kind, $user_id, $ts} | ...
```

Each alternative need not define all of the same variables, but all named variables will be available to the subsequent
expression. Variables not matched in the alternative that succeeded will be `null`:

```
.resources[] as {$id, $kind, events: {$user_id, $ts}} ?// {$id, $kind, events: [{$first_user_id, $first_ts}]} | {$user_id, $first_user_id, $kind, $id, $ts, $first_ts}
```

Additionally, if the subsequent expression returns an error, the alternative operator will attempt to try the next
binding. Errors that occur during the final alternative are passed through.

```
[[3]] | .[] as [$a] ?// [$b] | if $a != null then error("err: \($a)") else {$a,$b} end
```

#### Examples:
<mjf-example-table query=".[] as {$a, $b, c: {$d, $e}} ?// {$a, $b, c: [{$d, $e}]} | {$a, $b, $d, $e}" input='[{"a": 1, "b": 2, "c": {"d": 3, "e": 4}}, {"a": 1, "b": 2, "c": [{"d": 3, "e": 4}]}]' output="{&quot;a&quot;:1,&quot;b&quot;:2,&quot;d&quot;:3,&quot;e&quot;:4}&#10;{&quot;a&quot;:1,&quot;b&quot;:2,&quot;d&quot;:3,&quot;e&quot;:4}"></mjf-example-table>
<mjf-example-table query=".[] as {$a, $b, c: {$d}} ?// {$a, $b, c: [{$e}]} | {$a, $b, $d, $e}" input='[{"a": 1, "b": 2, "c": {"d": 3, "e": 4}}, {"a": 1, "b": 2, "c": [{"d": 3, "e": 4}]}]' output="{&quot;a&quot;:1,&quot;b&quot;:2,&quot;d&quot;:3,&quot;e&quot;:null}&#10;{&quot;a&quot;:1,&quot;b&quot;:2,&quot;d&quot;:null,&quot;e&quot;:4}"></mjf-example-table>
<mjf-example-table query=".[] as [$a] ?// [$b] | if $a != null then error(&quot;err: \($a)&quot;) else {$a,$b} end" input='[[3]]' output="{&quot;a&quot;:null,&quot;b&quot;:3}"></mjf-example-table>

### Defining Functions

You can give a filter a name using "def" syntax:

```
def increment: . + 1;
```

From then on, `increment` is usable as a filter just like a builtin function (in fact, this is how many of the builtins
are defined). A function may take arguments:

```
def map(f): [.[] | f];
```

Arguments are passed as _filters_ (functions with no arguments), _not_ as values. The same argument may be referenced
multiple times with different inputs (here `f` is run for each element of the input array). Arguments to a function work
more like callbacks than like value arguments. This is important to understand. Consider:

```
def foo(f): f|f;
5|foo(.*2)
```

The result will be 20 because `f` is `.*2`, and during the first invocation of `f` `.` will be 5, and the second time it
will be 10 (5 \* 2), so the result will be 20. Function arguments are filters, and filters expect an input when invoked.

If you want the value-argument behaviour for defining simple functions, you can just use a variable:

```
def addvalue(f): f as $f | map(. + $f);
```

Or use the short-hand:

```
def addvalue($f): ...;
```

With either definition, `addvalue(.foo)` will add the current input's `.foo` field to each element of the array. Do note
that calling `addvalue(.[])` will cause the `map(. + $f)` part to be evaluated once per value in the value of `.` at the
call site.

Multiple definitions using the same function name are allowed. Each re-definition replaces the previous one for the same
number of function arguments, but only for references from functions (or main program) subsequent to the re-definition.
See also the section below on scoping.

#### Examples:
<mjf-example-table query="def addvalue(f): . + [f]; map(addvalue(.[0]))" input='[[1,2],[10,20]]' output="[[1,2,1], [10,20,10]]"></mjf-example-table>
<mjf-example-table query="def addvalue(f): f as $x | map(. + $x); addvalue(.[0])" input='[[1,2],[10,20]]' output="[[1,2,1,2], [10,20,1,2]]"></mjf-example-table>

### Scoping

There are two types of symbols in jq: value bindings (a.k.a., "variables"), and functions. Both are scoped lexically,
with expressions being able to refer only to symbols that have been defined "to the left" of them. The only exception to
this rule is that functions can refer to themselves so as to be able to create recursive functions.

For example, in the following expression there is a binding which is visible "to the right" of it,
`... | .*3 as $times_three | [. + $times_three] | ...`, but not "to the left". Consider this expression now,
`... | (.*3 as $times_three | [. + $times_three]) | ...`: here the binding `$times_three` is _not_ visible past the
closing parenthesis.

### `isempty(exp)`

Returns true if `exp` produces no outputs, false otherwise.

#### Examples:
<mjf-example-table query="isempty(empty)" input='null' output="true"></mjf-example-table>
<mjf-example-table query="isempty(.[])" input='[]' output="true"></mjf-example-table>
<mjf-example-table query="isempty(.[])" input='[1,2,3]' output="false"></mjf-example-table>

### `limit(n; exp)`

The `limit` function extracts up to `n` outputs from `exp`.

#### Examples:
<mjf-example-table query="[limit(3;.[])]" input='[0,1,2,3,4,5,6,7,8,9]' output="[0,1,2]"></mjf-example-table>

### `first(expr)`, `last(expr)`, `nth(n; expr)`

The `first(expr)` and `last(expr)` functions extract the first and last values from `expr`, respectively.

The `nth(n; expr)` function extracts the nth value output by `expr`. Note that `nth(n; expr)` doesn't support negative
values of `n`.

#### Examples:
<mjf-example-table query="[first(range(.)), last(range(.)), nth(./2; range(.))]" input='10' output="[0,9,5]"></mjf-example-table>

### `first`, `last`, `nth(n)`

The `first` and `last` functions extract the first and last values from any array at `.`.

The `nth(n)` function extracts the nth value of any array at `.`.

#### Examples:
<mjf-example-table query="[range(.)]|[first, last, nth(5)]" input='10' output="[0,9,5]"></mjf-example-table>

### `reduce`

The `reduce` syntax allows you to combine all of the results of an expression by accumulating them into a single answer.
The form is `reduce EXP as $var (INIT; UPDATE)`. As an example, we'll pass `[1,2,3]` to this expression:

```
reduce .[] as $item (0; . + $item)
```

For each result that `.[]` produces, `. + $item` is run to accumulate a running total, starting from 0 as the input
value. In this example, `.[]` produces the results `1`, `2`, and `3`, so the effect is similar to running something like
this:

```
0 | 1 as $item | . + $item |
    2 as $item | . + $item |
    3 as $item | . + $item
```

#### Examples:
<mjf-example-table query="reduce .[] as $item (0; . + $item)" input='[1,2,3,4,5]' output="15"></mjf-example-table>
<mjf-example-table query="reduce .[] as [$i,$j] (0; . + $i * $j)" input='[[1,2],[3,4],[5,6]]' output="44"></mjf-example-table>
<mjf-example-table query="reduce .[] as {$x,$y} (null; .x += $x | .y += [$y])" input='[{"x":"a","y":1},{"x":"b","y":2},{"x":"c","y":3}]' output="{&quot;x&quot;:&quot;abc&quot;,&quot;y&quot;:[1,2,3]}"></mjf-example-table>

### `foreach`

The `foreach` syntax is similar to `reduce`, but intended to allow the construction of `limit` and reducers that produce
intermediate results.

The form is `foreach EXP as $var (INIT; UPDATE; EXTRACT)`. As an example, we'll pass `[1,2,3]` to this expression:

```
foreach .[] as $item (0; . + $item; [$item, . * 2])
```

Like the `reduce` syntax, `. + $item` is run for each result that `.[]` produces, but `[$item, . * 2]` is run for each
intermediate values. In this example, since the intermediate values are `1`, `3`, and `6`, the `foreach` expression
produces `[1,2]`, `[2,6]`, and `[3,12]`. So the effect is similar to running something like this:

```
0 | 1 as $item | . + $item | [$item, . * 2],
    2 as $item | . + $item | [$item, . * 2],
    3 as $item | . + $item | [$item, . * 2]
```

When `EXTRACT` is omitted, the identity filter is used. That is, it outputs the intermediate values as they are.

#### Examples:
<mjf-example-table query="foreach .[] as $item (0; . + $item)" input='[1,2,3,4,5]' output="1&#10;3&#10;6&#10;10&#10;15"></mjf-example-table>
<mjf-example-table query="foreach .[] as $item (0; . + $item; [$item, . * 2])" input='[1,2,3,4,5]' output="[1,2]&#10;[2,6]&#10;[3,12]&#10;[4,20]&#10;[5,30]"></mjf-example-table>
<mjf-example-table query="foreach .[] as $item (0; . + 1; {index: ., $item})" input='["foo", "bar", "baz"]' output="{&quot;index&quot;:1,&quot;item&quot;:&quot;foo&quot;}&#10;{&quot;index&quot;:2,&quot;item&quot;:&quot;bar&quot;}&#10;{&quot;index&quot;:3,&quot;item&quot;:&quot;baz&quot;}"></mjf-example-table>

### Recursion

As described above, `recurse` uses recursion, and any jq function can be recursive. The `while` builtin is also
implemented in terms of recursion.

Tail calls are optimized whenever the expression to the left of the recursive call outputs its last value. In practice
this means that the expression to the left of the recursive call should not produce more than one output for each input.

For example:

```
def recurse(f): def r: ., (f | select(. != null) | r); r;def while(cond; update):
  def _while:
    if cond then ., (update | _while) else empty end;
  _while;def repeat(exp):
  def _repeat:
    exp, _repeat;
  _repeat;
```

### Generators and iterators

Some jq operators and functions are actually generators in that they can produce zero, one, or more values for each
input, just as one might expect in other programming languages that have generators. For example, `.[]` generates all
the values in its input (which must be an array or an object), `range(0; 10)` generates the integers between 0 and 10,
and so on.

Even the comma operator is a generator, generating first the values generated by the expression to the left of the
comma, then the values generated by the expression on the right of the comma.

The `empty` builtin is the generator that produces zero outputs. The `empty` builtin backtracks to the preceding
generator expression.

All jq functions can be generators just by using builtin generators. It is also possible to construct new generators
using only recursion and the comma operator. If recursive calls are "in tail position" then the generator will be
efficient. In the example below the recursive call by `_range` to itself is in tail position. The example shows off
three advanced topics: tail recursion, generator construction, and sub-functions.

#### Examples:
<mjf-example-table query="def range(init; upto; by): def _range: if (by &gt; 0 and . &lt; upto) or (by &lt; 0 and . &gt; upto) then ., ((.+by)|_range) else . end; if by == 0 then init else init|_range end | select((by &gt; 0 and . &lt; upto) or (by &lt; 0 and . &gt; upto)); range(0; 10; 3)" input='null' output="0&#10;3&#10;6&#10;9"></mjf-example-table>
<mjf-example-table query="def while(cond; update): def _while: if cond then ., (update | _while) else empty end; _while; [while(.&lt;100; .*2)]" input='1' output="[1,2,4,8,16,32,64]"></mjf-example-table>
