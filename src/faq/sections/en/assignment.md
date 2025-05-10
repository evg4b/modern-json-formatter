## Assignment

Assignment works a little differently in jq than in most programming languages. jq doesn't distinguish between references to and copies of something - two objects or arrays are either equal or not equal, without any further notion of being "the same object" or "not the same object".

If an object has two fields which are arrays, `.foo` and `.bar`, and you append something to `.foo`, then `.bar` will not get bigger, even if you've previously set `.bar = .foo`. If you're used to programming in languages like Python, Java, Ruby, JavaScript, etc. then you can think of it as though jq does a full deep copy of every object before it does the assignment (for performance it doesn't actually do that, but that's the general idea).

This means that it's impossible to build circular values in jq (such as an array whose first element is itself). This is quite intentional, and ensures that anything a jq program can produce can be represented in JSON.

All the assignment operators in jq have path expressions on the left-hand side (LHS). The right-hand side (RHS) provides values to set to the paths named by the LHS path expressions.

Values in jq are always immutable. Internally, assignment works by using a reduction to compute new, replacement values for `.` that have had all the desired assignments applied to `.`, then outputting the modified value. This might be made clear by this example: `{a:{b:{c:1}}} | (.a.b|=3), .`. This will output `{"a":{"b":3}}` and `{"a":{"b":{"c":1}}}` because the last sub-expression, `.`, sees the original value, not the modified value.

Most users will want to use modification assignment operators, such as `|=` or `+=`, rather than `=`.

Note that the LHS of assignment operators refers to a value in `.`. Thus `$var.foo = 1` won't work as expected (`$var.foo` is not a valid or useful path expression in `.`); use `$var | .foo = 1` instead.

Note too that `.a,.b=0` does not set `.a` and `.b`, but `(.a,.b)=0` sets both.

### Update-assignment: `|=`

This is the "update" operator `|=`. It takes a filter on the right-hand side and works out the new value for the property of `.` being assigned to by running the old value through this expression. For instance, `(.foo, .bar) |= .+1` will build an object with the `foo` field set to the input's `foo` plus 1, and the `bar` field set to the input's `bar` plus 1.

The left-hand side can be any general path expression; see `path()`.

Note that the left-hand side of `|=` refers to a value in `.`. Thus `$var.foo |= . + 1` won't work as expected (`$var.foo` is not a valid or useful path expression in `.`); use `$var | .foo |= . + 1` instead.

If the right-hand side outputs no values (i.e., `empty`), then the left-hand side path will be deleted, as with `del(path)`.

If the right-hand side outputs multiple values, only the first one will be used (COMPATIBILITY NOTE: in jq 1.5 and earlier releases, it used to be that only the last one was used).

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example106" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">(..|select(type=="boolean")) |= if . then 1 else 0 end</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[true,false,[5,true,[true,[false]],false]]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[1,0,[5,1,[1,[0]],0]]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### Arithmetic update-assignment: `+=`, `-=`, `*=`, `/=`, `%=`, `//=`

jq has a few operators of the form `a op= b`, which are all equivalent to `a |= . op b`. So, `+= 1` can be used to increment values, being the same as `|= . + 1`.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example107" class="mx-3 small d-print-block collapse show">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.foo += 1</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"foo": 42}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"foo": 43}</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### Plain assignment: `=`

This is the plain assignment operator. Unlike the others, the input to the right-hand side (RHS) is the same as the input to the left-hand side (LHS) rather than the value at the LHS path, and all values output by the RHS will be used (as shown below).

If the RHS of `=` produces multiple values, then for each such value jq will set the paths on the left-hand side to the value and then it will output the modified `.`. For example, `(.a,.b) = range(2)` outputs `{"a":0,"b":0}`, then `{"a":1,"b":1}`. The "update" assignment forms (see above) do not do this.

This example should show the difference between `=` and `|=`:

Provide input `{"a": {"b": 10}, "b": 20}` to the programs

```
.a = .b
```

and

```
.a |= .b
```

The former will set the `a` field of the input to the `b` field of the input, and produce the output `{"a": 20, "b": 20}`. The latter will set the `a` field of the input to the `a` field's `b` field, producing `{"a": 10, "b": 20}`.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example108" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.a = .b</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a": {"b": 10}, "b": 20}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"a":20,"b":20}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.a |= .b</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">{"a": {"b": 10}, "b": 20}</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"a":10,"b":20}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">(.a, .b) = range(3)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">null</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"a":0,"b":0}</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">{"a":1,"b":1}</td>
      </tr>
      <tr>
        <th></th>
        <td class="font-monospace">{"a":2,"b":2}</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">(.a, .b) |= range(3)</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">null</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">{"a":0,"b":0}</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>

### Complex assignments

Lots more things are allowed on the left-hand side of a jq assignment than in most languages. We've already seen simple field accesses on the left hand side, and it's no surprise that array accesses work just as well:

```
.posts[0].title = "JQ Manual"
```

What may come as a surprise is that the expression on the left may produce multiple results, referring to different points in the input document:

```
.posts[].comments |= . + ["this is great"]
```

That example appends the string "this is great" to the "comments" array of each post in the input (where the input is an object with a field "posts" which is an array of posts).

When jq encounters an assignment like 'a = b', it records the "path" taken to select a part of the input document while executing a. This path is then used to find which part of the input to change while executing the assignment. Any filter may be used on the left-hand side of an equals - whichever paths it selects from the input will be where the assignment is performed.

This is a very powerful operation. Suppose we wanted to add a comment to blog posts, using the same "blog" input above. This time, we only want to comment on the posts written by "stedolan". We can find those posts using the "select" function described earlier:

```
.posts[] | select(.author == "stedolan")
```

The paths provided by this operation point to each of the posts that "stedolan" wrote, and we can comment on each of them in the same way that we did before:

```
(.posts[] | select(.author == "stedolan") | .comments) |= . + ["terrible."]
```
