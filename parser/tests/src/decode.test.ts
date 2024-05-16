import '../../wasm_exec.js';
import {loadWasm} from "./load-wasm";


declare function parseJSON(data: string): ParserResponse;

describe('sum module', () => {
    loadWasm();

    test('should be defined', () => {
        expect(parseJSON).toBeDefined();
    });

    test('sum', () => {
        const d = parseJSON('{ "a": 1, "b": 2 }');
        expect(d).toMatchSnapshot()
    });
});
