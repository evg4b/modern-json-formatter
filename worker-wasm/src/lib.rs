use core::{format_json, minify_json, query_json, tokenize_json};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

mod convert;
pub mod utils;

#[wasm_bindgen]
pub fn tokenize(json: &str) -> Result<JsValue, JsError> {
    tokenize_json(json)
        .map_err(|e| JsError::new(&e.to_string()))
        .and_then(convert::node_to_jsvalue)
}

#[wasm_bindgen]
pub fn query(json: &str, query: &str) -> Result<JsValue, JsError> {
    query_json(json, query)
        .map_err(|e| JsError::new(&e.to_string()))
        .and_then(convert::node_to_jsvalue)
}

#[wasm_bindgen]
pub fn minify(input: &str) -> Result<String, JsError> {
    minify_json(input).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn format(input: &str) -> Result<String, JsError> {
    format_json(input).map_err(|e| JsError::new(&e.to_string()))
}
