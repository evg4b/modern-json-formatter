## Math

jq currently only has IEEE754 double-precision (64-bit) floating point number support.

Besides simple arithmetic operators such as `+`, jq also has most standard math functions from the C math library. C
math functions that take a single input argument (e.g., `sin()`) are available as zero-argument jq functions. C math
functions that take two input arguments (e.g., `pow()`) are available as two-argument jq functions that ignore `.`. C
math functions that take three input arguments are available as three-argument jq functions that ignore `.`.

Availability of standard math functions depends on the availability of the corresponding math functions in your
operating system and C math library. Unavailable math functions will be defined but will raise an error.

One-input C math functions: `acos` `acosh` `asin` `asinh` `atan` `atanh` `cbrt` `ceil` `cos` `cosh` `erf` `erfc` `exp`
`exp10` `exp2` `expm1` `fabs` `floor` `gamma` `j0` `j1` `lgamma` `log` `log10` `log1p` `log2` `logb` `nearbyint` `pow10`
`rint` `round` `significand` `sin` `sinh` `sqrt` `tan` `tanh` `tgamma` `trunc` `y0` `y1`.

Two-input C math functions: `atan2` `copysign` `drem` `fdim` `fmax` `fmin` `fmod` `frexp` `hypot` `jn` `ldexp` `modf`
`nextafter` `nexttoward` `pow` `remainder` `scalb` `scalbln` `yn`.

Three-input C math functions: `fma`.

See your system's manual for more information on each of these.
