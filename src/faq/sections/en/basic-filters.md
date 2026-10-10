## Basic filters

### Identity: `.`

The absolute simplest filter is `.` . This filter takes its input and produces the same value as output. That is, this
is the identity operator.

Applied to the whole document, `.` shows it unchanged in the query view.

Although the identity filter never modifies its input, the way numbers are handled can make it look as if it does. In
this extension:

1. A number that is only passed through keeps the exact text it was written with, so `1E1234567890 | .` produces
   `1E1234567890` and `1.000` stays `1.000`.

2. Arithmetic on integers is exact at any size.

3. Arithmetic that involves a number with a fraction or an exponent converts it to an IEEE754 double-precision
   value, which can lose precision.

4. Comparisons between integers are exact, as one of the following examples shows.

#### Examples:
<mjf-example-table query="." input='"Hello, world!"' output="&quot;Hello, world!&quot;"></mjf-example-table>
<mjf-example-table query="." input='0.12345678901234567890123456789' output="0.12345678901234567890123456789"></mjf-example-table>
<mjf-example-table query="[., tojson]" input='12345678909876543212345' output="[12345678909876543212345,&quot;12345678909876543212345&quot;]"></mjf-example-table>
<mjf-example-table query=". &lt; 0.12345678901234567890123456788" input='0.12345678901234567890123456789' output="false"></mjf-example-table>
<mjf-example-table query="map([., . == 1]) | tojson" input='[1, 1.000, 1.0, 100e-2]' output="&quot;[[1,true],[1.000,true],[1.0,true],[100e-2,true]]&quot;"></mjf-example-table>
<mjf-example-table query=". as $big | [$big, $big + 1] | map(. &gt; 10000000000000000000000000000000)" input='10000000000000000000000000000001' output="[true, true]"></mjf-example-table>
