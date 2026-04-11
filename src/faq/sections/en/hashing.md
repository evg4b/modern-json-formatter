## Hashing

Modern JSON Formatter extends jq with built-in cryptographic hash functions. These functions take a **string** input and
return the lowercase hexadecimal digest. Passing a non-string value (e.g. a number or object) raises an error.

### `md5`

Computes the **MD5** hash of a string and outputs its 32-character lowercase hex digest.

> **Note:** MD5 is not cryptographically secure. Use it only for checksums or non-security-critical fingerprinting.

#### Examples:
<mjf-example-table query="md5" input='"hello"' output='"5d41402abc4b2a76b9719d911017c592"'></mjf-example-table>
<mjf-example-table query=".token | md5" input='{"token": "secret"}' output='"5ebe2294ecd0e0f08eab7690d2a6ee69"'></mjf-example-table>
<mjf-example-table query="map(md5)" input='["foo", "bar"]' output='["acbd18db4cc2f85cedef654fccc4a4d8","37b51d194a7513e45b56f6524f2d51f2"]'></mjf-example-table>

### `sha256`

Computes the **SHA-256** hash of a string and outputs its 64-character lowercase hex digest.

#### Examples:
<mjf-example-table query="sha256" input='"hello"' output='"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"'></mjf-example-table>
<mjf-example-table query=".password | sha256" input='{"password": "hunter2"}' output='"f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7"'></mjf-example-table>

### `sha512`

Computes the **SHA-512** hash of a string and outputs its 128-character lowercase hex digest.

#### Examples:
<mjf-example-table query="sha512" input='"hello"' output='"9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"'></mjf-example-table>
<mjf-example-table query=".data | sha512" input='{"data": "hello world"}' output='"309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f"'></mjf-example-table>
