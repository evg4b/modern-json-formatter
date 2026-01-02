mod utils;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct Property {
    key: String,
    value: ResultValue,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "value", rename_all = "lowercase")] // для enum с разными вариантами
pub enum ResultValue {
    Null,
    Object(Vec<Property>),
    Array(Vec<ResultValue>),
    String {
        value: String,
        variant: Option<String>,
    },
    Number(String),
    Boolean(bool),
    Tuple(Vec<ResultValue>),
}

#[wasm_bindgen]
pub fn jq(json: &str, query: &str) -> Result<JsValue, JsError> {
    let result = to_value(&ResultValue::Array(vec![
        ResultValue::String {
            value: String::from(json),
            variant: None,
        },
        ResultValue::String {
            value: String::from(query),
            variant: None,
        },
        ResultValue::Null,
        ResultValue::Object(vec![Property {
            key: "foo".into(),
            value: ResultValue::String {
                value: "bar".into(),
                variant: None,
            },
        }]),
        ResultValue::Number(String::from("3.14")),
        ResultValue::Boolean(true),
    ]));

    match result {
        Ok(result) => Ok(result),
        Err(err) => Err(JsError::from(err)),
    }
}

#[wasm_bindgen]
pub fn tokenize(json: &str) -> Result<JsValue, JsError> {
    let result = to_value(&ResultValue::Array(vec![
        ResultValue::String {
            value: String::from(json),
            variant: Some("string".into()),
        },
        ResultValue::String {
            value: "b".into(),
            variant: Some("string".into()),
        },
        ResultValue::Null,
        ResultValue::Object(vec![Property {
            key: "foo".into(),
            value: ResultValue::String {
                value: "bar".into(),
                variant: Some("string".into()),
            },
        }]),
        ResultValue::Number(String::from("3.14")),
        ResultValue::Boolean(true),
    ]));

    match result {
        Ok(result) => Ok(result),
        Err(err) => Err(JsError::new(&format!("{}", err))),
    }
}

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
