use crate::node::{Property, ResultValue};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

#[wasm_bindgen]
pub fn jq(json: &str, query: &str) -> Result<JsValue, JsError> {
    let result = to_value(&ResultValue::Array {
        items: vec![
            ResultValue::String {
                value: String::from(json),
                variant: None,
            },
            ResultValue::String {
                value: String::from(query),
                variant: None,
            },
            ResultValue::Null,
            ResultValue::Object {
                properties: vec![Property {
                    key: String::from("key"),
                    value: ResultValue::String {
                        value: String::from("value"),
                        variant: None,
                    },
                }],
            },
            ResultValue::Number {
                value: String::from("123"),
            },
            ResultValue::Boolean { value: true },
        ],
    });

    match result {
        Ok(result) => Ok(result),
        Err(err) => Err(JsError::from(err)),
    }
}
