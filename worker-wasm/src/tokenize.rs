use crate::node::{Property, ResultValue};
use serde_json::Value;
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

pub fn convert(value: Value) -> ResultValue {
    match value {
        Value::Null => ResultValue::Null,
        Value::Bool(value) => ResultValue::Boolean { value },
        Value::Number(value) => ResultValue::Number {
            value: value.to_string(),
        },
        Value::String(s) => ResultValue::String {
            value: s,
            variant: None,
        },
        Value::Array(arr) => ResultValue::Array {
            items: arr.into_iter().map(convert).collect(),
        },
        Value::Object(map) => ResultValue::Object {
            properties: map
                .into_iter()
                .map(|(key, value)| Property {
                    key,
                    value: convert(value),
                })
                .collect(),
        },
    }
}

#[wasm_bindgen]
pub fn tokenize(json: &str) -> Result<JsValue, JsError> {
    match serde_json::from_str(json) {
        Ok(v) => match to_value(&convert(v)) {
            Ok(value) => Ok(value),
            Err(err) => Err(JsError::from(err)),
        },
        Err(e) => Err(JsError::from(e)),
    }
}
