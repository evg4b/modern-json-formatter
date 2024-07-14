// import fs from 'fs/promises';
// import { tArray, tBool, tNull, tNumber, tObject, tProperty, tString } from '../../testing';
//
//
describe('tokenizer wasm', () => {
  it('z', () => {});
//   let go: Go;
//
//   interface TestCase {
//     name: string;
//     input: string;
//     expected: TokenNode;
//   }
//
//   const runTestCases = (testCases: TestCase[]) => {
//     testCases.forEach(({ name, input, expected }) => {
//       it(name, () => {
//         const actual = ___tokenizeJSON(input);
//         expect(actual).toEqual(expected);
//       });
//     });
//   };
//
//   beforeAll(async () => {
//     const wasmBuffer = await fs.readFile('tokenizer/tokenizer.wasm');
//     go = new Go();
//     const wasm = await WebAssembly.instantiate(wasmBuffer, go.importObject);
//     go.run(wasm.instance);
//   });
//
//   test('exported function should be defined', () => {
//     expect(___tokenizeJSON).toBeDefined();
//   });
//
//   describe('primitives', () => {
//     it('null', () => {
//       const actual = ___tokenizeJSON('null');
//       expect(actual).toEqual(
//         tNull(),
//       );
//     });
//
//     describe('boolean', () => {
//       runTestCases([
//         { name: 'true', input: 'true', expected: tBool(true) },
//         { name: 'false', input: 'false', expected: tBool(false) },
//       ]);
//     });
//
//     describe('number', () => {
//       describe('integer', () => {
//         runTestCases([
//           { name: 'positive', input: '42', expected: tNumber('42') },
//           { name: 'negative', input: '-42', expected: tNumber('-42') },
//           { name: 'max int8', input: '127', expected: tNumber('127') },
//           { name: 'min int8', input: '-128', expected: tNumber('-128') },
//           { name: 'max int16', input: '32767', expected: tNumber('32767') },
//           { name: 'min int16', input: '-32768', expected: tNumber('-32768') },
//           { name: 'max int32', input: '2147483647', expected: tNumber('2147483647') },
//           { name: 'min int32', input: '-2147483648', expected: tNumber('-2147483648') },
//           { name: 'max int64', input: '9223372036854775807', expected: tNumber('9223372036854775807') },
//           { name: 'min int64', input: '-9223372036854775808', expected: tNumber('-9223372036854775808') },
//         ]);
//       });
//
//       describe('unsigned integers', () => {
//         runTestCases([
//           { name: 'max uint8', input: '255', expected: tNumber('255') },
//           { name: 'max uint16', input: '65535', expected: tNumber('65535') },
//           { name: 'max uint32', input: '4294967295', expected: tNumber('4294967295') },
//           { name: 'max uint64', input: '18446744073709551615', expected: tNumber('18446744073709551615') },
//         ]);
//       });
//
//       describe('float', () => {
//         runTestCases([
//           { name: 'positive', input: '42.42', expected: tNumber('42.42') },
//           { name: 'negative', input: '-42.42', expected: tNumber('-42.42') },
//           { name: 'maximum js value + 1', input: '23064690611454417', expected: tNumber('23064690611454417') },
//           {
//             name: 'max float32',
//             input: '3.40282346638528859811704183484516925440e+38',
//             expected: tNumber('3.40282346638528859811704183484516925440e+38'),
//           },
//           {
//             name: 'smallest nonzero float32',
//             input: '1.401298464324817070923729583289916131280e-45',
//             expected: tNumber('1.401298464324817070923729583289916131280e-45'),
//           },
//           {
//             name: 'max float64',
//             input: '1.79769313486231570814527423731704356798070e+308',
//             expected: tNumber('1.79769313486231570814527423731704356798070e+308'),
//           },
//           {
//             name: 'smallest nonzero float64',
//             input: '4.9406564584124654417656879286822137236505980e-324',
//             expected: tNumber('4.9406564584124654417656879286822137236505980e-324'),
//           },
//         ]);
//       });
//     });
//
//     describe('string', () => {
//       runTestCases([
//         { name: 'empty', input: '""', expected: tString('') },
//         { name: 'non-empty', input: '"hello"', expected: tString('hello') },
//         { name: 'with escaped quotes', input: '"hello \\"world\\""', expected: tString('hello "world"') },
//         { name: 'with escaped backslashes', input: '"hello \\\\world"', expected: tString('hello \\world') },
//       ]);
//     });
//   });
//
//   runTestCases([
//     { name: 'should parse empty array', input: '[]', expected: tArray() },
//     { name: 'should parse empty object', input: '{}', expected: tObject() },
//     {
//       name: 'should parse JSON',
//       input: '{"a": 1}',
//       expected:
//         tObject(
//           tProperty('a', tNumber('1')),
//         ),
//     },
//     {
//       name: 'should parse JSON with nested objects',
//       input: '{"a": {"b": 2}}',
//       expected:
//         tObject(
//           tProperty('a', tObject(
//             tProperty('b', tNumber('2')),
//           )),
//         ),
//     },
//     {
//       name: 'should parse JSON with arrays',
//       input: '[1, 2, 3]',
//       expected:
//         tArray(
//           tNumber('1'),
//           tNumber('2'),
//           tNumber('3'),
//         ),
//     },
//   ]);
});
