use serde_wasm_bindgen::to_value;
use wasm_bindgen::{JsError, JsValue};
use wasm_bindgen::prelude::wasm_bindgen;
use crate::node::{Property, ResultValue};

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

