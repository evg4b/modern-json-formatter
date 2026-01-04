//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;

use wasm_bindgen_test::*;
use worker_wasm::jq::jq;
use worker_wasm::node::ResultValue;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_js() {
    let actual_js_value = jq(r#"{"foo":   "bar","baz": [1, 2, 3]}"#, ".foo").unwrap();

    let actual: ResultValue = serde_wasm_bindgen::from_value(actual_js_value).unwrap();

    assert_eq!(
        actual,
        ResultValue::Tuple {
            items: vec![ResultValue::String {
                value: "bar".to_string(),
                variant: None,
            }],
        }
    );
}
