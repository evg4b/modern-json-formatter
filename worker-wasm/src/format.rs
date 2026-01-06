use json5::from_str;
use serde_json::to_string_pretty;
use serde_json::Value;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsError;

#[wasm_bindgen]
pub fn format(input: &str) -> Result<String, JsError> {
    let value = from_str::<Value>(input)?;
    Ok(to_string_pretty(&value)?)
}
