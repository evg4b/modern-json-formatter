use core::{query_json, tokenize_json, minify_json, format_json};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

pub mod utils;

#[wasm_bindgen]
pub fn tokenize(json: &str) -> Result<JsValue, JsError> {
    tokenize_json(json)
        .map_err(|e| JsError::new(&e.to_string()))
        .and_then(|node| to_value(&node).map_err(|e| JsError::from(e)))
}

#[wasm_bindgen]
pub fn query(json: &str, query: &str) -> Result<JsValue, JsError> {
    query_json(json, query)
        .map_err(|e| JsError::new(&e.to_string()))
        .and_then(|result| to_value(&result).map_err(|e| JsError::from(e)))
}

#[wasm_bindgen]
pub fn minify(input: &str) -> Result<String, JsError> {
    minify_json(input).map_err(|e| JsError::new(&e.to_string()))
}

#[wasm_bindgen]
pub fn format(input: &str) -> Result<String, JsError> {
    format_json(input).map_err(|e| JsError::new(&e.to_string()))
}
