//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;
use worker_wasm::minify::minify;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn pass() {
    let demo = minify(r#"{
        "foo":   "bar",
        "baz": [1, 2, 3]
    }"#).unwrap();

    assert_eq!(demo, "{\"foo\":\"bar\",\"baz\":[1,2,3]}");
}


