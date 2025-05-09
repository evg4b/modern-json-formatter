## Basic filters

### Identity: `.`

The absolute simplest filter is `.` . This filter takes its input and produces the same value as output. That is, this
is the identity operator.

Since jq by default pretty-prints all output, a trivial program consisting of nothing but `.`can be used to format JSON
output from, say, `curl`.

Although the identity filter never modifies the value of its input, jq processing can sometimes make it
appear as though it does. For example, using the current implementation of jq, we would see that the
expression:

```
1E1234567890 | .
```

produces `1.7976931348623157e+308` on at least one platform. This is because, in the process
of
parsing the number, this particular version of jq has converted it to an IEEE754 double-precision
representation, losing precision.

The way in which jq handles numbers has changed over time and further changes are likely within the
parameters set by the relevant JSON standards. The following remarks are therefore offered with the
understanding that they are intended to be descriptive of the current version of jq and should not be
interpreted as being prescriptive:

1. Any arithmetic operation on a number that has not already been converted to an IEEE754 double precision
representation will trigger a conversion to the IEEE754 representation.

2. jq will attempt to maintain the original decimal precision of number literals, but in expressions such `
1E1234567890`, precision will be lost if the exponent is too large.

3. In jq programs, a leading minus sign will trigger the conversion of the number to an IEEE754 representation.

4. Comparisons are carried out using the untruncated big decimal representation of numbers if available, as illustrated
in one of the following examples.

<div class="pb-3">
  <h4 class="examples">Examples:</h4>
  <div id="example1" class="collapse mx-3 small d-print-block">
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">"Hello, world!"</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">"Hello, world!"</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">.</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">0.12345678901234567890123456789</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">0.12345678901234567890123456789</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">[., tojson]</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">12345678909876543212345</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[12345678909876543212345,"12345678909876543212345"]</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">. &lt; 0.12345678901234567890123456788</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">0.12345678901234567890123456789</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">false</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">map([., . == 1]) | tojson</td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">[1, 1.000, 1.0, 100e-2]</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">"[[1,true],[1.000,true],[1.0,true],[1.00,true]]"</td>
      </tr>
      </tbody>
    </table>
    <table class="table table-borderless table-sm w-auto">
      <tbody>
      <tr>
        <th class="pe-3">Query</th>
        <td class="font-monospace">
          . as $big | [$big, $big + 1] | map(. &gt; 10000000000000000000000000000000)
        </td>
      </tr>
      <tr>
        <th>Input</th>
        <td class="font-monospace">10000000000000000000000000000001</td>
      </tr>
      <tr>
        <th>Output</th>
        <td class="font-monospace">[true, false]</td>
      </tr>
      </tbody>
    </table>
  </div>
</div>
