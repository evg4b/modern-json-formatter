## Math

Integers are exact at any size. Numbers with a fraction or an exponent, and the results of division and of the math
functions below, are IEEE754 double-precision (64-bit) floating point values.

Besides simple arithmetic operators such as `+`, jq also has most standard math functions from the C math library. C
math functions that take a single input argument (e.g., `sin()`) are available as zero-argument jq functions. C math
functions that take two input arguments (e.g., `pow()`) are available as two-argument jq functions that ignore `.`. C
math functions that take three input arguments are available as three-argument jq functions that ignore `.`.

All of them are built into the extension, so they work the same on every operating system.

One-input C math functions: `acos` `acosh` `asin` `asinh` `atan` `atanh` `cbrt` `ceil` `cos` `cosh` `erf` `erfc` `exp`
`exp10` `exp2` `expm1` `fabs` `floor` `frexp` `gamma` `j0` `j1` `lgamma` `log` `log10` `log1p` `log2` `logb` `modf`
`nearbyint` `pow10` `rint` `round` `significand` `sin` `sinh` `sqrt` `tan` `tanh` `tgamma` `trunc` `y0` `y1`.

`frexp` returns `[mantissa, exponent]` and `modf` returns `[fraction, integer part]`.

Two-input C math functions: `atan2` `copysign` `drem` `fdim` `fmax` `fmin` `fmod` `hypot` `jn` `ldexp` `nextafter`
`nexttoward` `pow` `remainder` `scalb` `scalbln` `yn`.

Three-input C math functions: `fma`.

`ceil`, `floor` and `round` return integers. A C library manual describes what each function computes.
