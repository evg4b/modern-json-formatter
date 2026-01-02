mod utils;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct Property {
    key: String,
    value: ResultValue,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "value")] // для enum с разными вариантами
pub enum ResultValue {
    Null,
    Object { properties: Vec<Property> },
    Array { items: Vec<ResultValue> },
    String(String),
    Number(f64),
    Boolean(bool),
}

#[wasm_bindgen]
pub fn jq(json: &str, query: &str) -> Result<JsValue, JsError> {
    let result = to_value(&ResultValue::Array {
        items: vec![
            ResultValue::String("a".into()),
            ResultValue::String("b".into()),
            ResultValue::Null,
            ResultValue::Object {
                properties: vec![Property {
                    key: "foo".into(),
                    value: ResultValue::String("bar".into()),
                }],
            },
            ResultValue::Number(3.14),
            ResultValue::Boolean(true)
        ],
    });

    match result {
        Ok(result) => Ok(result),
        Err(err) => Err(JsError::new(&format!("{}", err))),
    }
}

#[wasm_bindgen]
pub fn tokenize(json: &str) -> Result<JsValue, JsError> {
    let result = to_value(&ResultValue::Array {
        items: vec![
            ResultValue::String("a".into()),
            ResultValue::String("b".into()),
            ResultValue::Null,
            ResultValue::Object {
                properties: vec![Property {
                    key: "foo".into(),
                    value: ResultValue::String("bar".into()),
                }],
            },
            ResultValue::Number(3.14),
            ResultValue::Boolean(true)
        ],
    });

    match result {
        Ok(result) => Ok(result),
        Err(err) => Err(JsError::new(&format!("{}", err))),
    }
}

#[wasm_bindgen]
pub fn format(json: &str) -> Result<String, JsError> {
    Ok(json.to_string())
}
