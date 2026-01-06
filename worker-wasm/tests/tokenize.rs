//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;

use wasm_bindgen_test::*;
use worker_wasm::node::{Node, StringVariant};
use worker_wasm::tokenize::tokenize;
use serde_wasm_bindgen::from_value;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn tokenize_email() {
    let actual_js_value = tokenize(r#""demo@mail.com""#)
    .unwrap();

    let actual: Node = from_value(actual_js_value).unwrap();

    assert_eq!(
        actual,
        Node::String {
            value: "demo@mail.com".to_string(),
            variant: Some(StringVariant::Email),
        }
    );
}

#[wasm_bindgen_test]
fn tokenize_array() {
    let actual_js_value = tokenize(
        r#"
        [{}]
    "#,
    )
    .unwrap();

    let actual: Node = from_value(actual_js_value).unwrap();

    assert_eq!(
        actual,
        Node::Array {
            items: vec![Node::Object { properties: vec![] }]
        }
    );
}
