A jq query feature is a "filter": it takes an input, and produces an output. There are a lot of builtin
filters for extracting a particular field of an object, or converting a number to a string, or various other
standard tasks.

Filters can be combined in various ways - you can pipe the output of one filter into another filter, or
collect the output of a filter into an array.

Some filters produce multiple results, for instance there's one that produces all the elements of its input
array. Piping that filter into a second runs the second filter for each element of the array. Generally,
things that would be done with loops and iteration in other languages are just done by gluing filters
together
in jq.

It's important to remember that every filter has an input and an output. Even literals like "hello" or 42
are
filters - they take an input but always produce the same literal as output. Operations that combine two
filters, like addition, generally feed the same input to both and combine the results. So, you can implement
an averaging filter as `add / length` - feeding the input array both to the `add` filter and the `length` filter and
then performing the division.


But that's getting ahead of ourselves. :) Let's start with something simpler:
