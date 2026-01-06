//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;

use serde_json::{json, to_string, to_string_pretty};
use wasm_bindgen_test::*;
use worker_wasm::minify::minify;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_minify() {
    let value = json!({
        "foo":   "bar",
        "baz": [1, 2, 3],
        "nested": {
            "a": 1,
            "b": 2
        },
        "array": [ {"x": 10}, {"y": 20} ]
    });

    let source = to_string_pretty(&value).unwrap();
    let actual = minify(source.as_str()).unwrap();

    assert_eq!(actual, "{\"array\":[{\"x\":10},{\"y\":20}],\"baz\":[1,2,3],\"foo\":\"bar\",\"nested\":{\"a\":1,\"b\":2}}");
}

#[wasm_bindgen_test]
fn test_minify_2() {
    let value = json!({
        "foo":   "bar",
        "baz": [1, 2, 3],
        "nested": {
            "a": 1,
            "b": 2
        },
        "array": [ {"x": 10}, {"y": 20} ]
    });

    let source = to_string(&value).unwrap();
    let actual = minify(source.as_str()).unwrap();

    assert_eq!(actual, "{\"array\":[{\"x\":10},{\"y\":20}],\"baz\":[1,2,3],\"foo\":\"bar\",\"nested\":{\"a\":1,\"b\":2}}");
}
