//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;

use wasm_bindgen_test::*;
use worker_wasm::query::query;
use worker_wasm::node::Node;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_js() {
    let actual_js_value = query(r#"{"foo":   "bar","baz": [1, 2, 3]}"#, ".foo").unwrap();

    let actual: Node = serde_wasm_bindgen::from_value(actual_js_value).unwrap();

    assert_eq!(
        actual,
        Node::Tuple {
            items: vec![Node::String {
                value: "bar".to_string(),
                variant: None,
            }],
        }
    );
}
