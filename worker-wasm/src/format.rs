use serde_json::Value;
use wasm_bindgen::JsError;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn format(input: &str) -> Result<String, JsError> {
    match serde_json::from_str::<Value>(input) {
        Ok(value) => match serde_json::to_string_pretty(&value) {
            Ok(value) => Ok(value),
            Err(err) => Err(JsError::from(err)),
        },
        Err(err) => Err(JsError::from(err)),
    }
}
