use crate::node::{Property, ResultValue};
use json_event_parser::{JsonEvent, ReaderJsonParser};
use serde_wasm_bindgen::to_value;
use std::io::{Cursor, Error};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

fn tokenize_value<R: std::io::Read>(
    parser: &mut ReaderJsonParser<R>,
) -> Result<Option<ResultValue>, Error> {
    match parser.parse_next()? {
        JsonEvent::String(value) => Ok(Some(ResultValue::String {
            value: value.to_string(),
            variant: None,
        })),
        JsonEvent::Number(value) => Ok(Some(ResultValue::Number {
            value: value.to_string(),
        })),
        JsonEvent::Boolean(value) => Ok(Some(ResultValue::Boolean {
            value
        })),
        JsonEvent::Null => Ok(Some(ResultValue::Null)),
        JsonEvent::StartArray => {
            let mut items = vec![];
            loop {
                match tokenize_value(parser)? {
                    Some(value) => items.push(value),
                    None => break,
                }
            }
            Ok(Some(ResultValue::Array { items: vec![] }))
        }
        JsonEvent::StartObject => {
            let mut properties = vec![];
            loop {
                let key = match parser.parse_next()? {
                    JsonEvent::ObjectKey(key) => key.to_string(),
                    JsonEvent::EndObject => break,
                    _ => return Err(Error::new(
                        std::io::ErrorKind::InvalidData,
                        "Expected object key or end of object",
                    )),
                };
                match tokenize_value(parser)? {
                    Some(value) => properties.push(Property {
                        key,
                        value,
                    }),
                    None => return Err(Error::new(
                        std::io::ErrorKind::InvalidData,
                        "Expected value after object key",
                    ))
                }
            }
            Ok(Some(ResultValue::Object { properties }))
        }
        JsonEvent::ObjectKey(_) => {
            Ok(None)
        },
        JsonEvent::EndArray | JsonEvent::EndObject | JsonEvent::Eof => Ok(None),
    }
}

#[wasm_bindgen]
pub fn tokenize(json: &str) -> Result<JsValue, JsError> {
    let mut parser = ReaderJsonParser::new(Cursor::new(json.as_bytes()));

    match tokenize_value(&mut parser) {
        Ok(v) => match to_value(&v) {
            Ok(js_value) => Ok(js_value),
            Err(e) => Err(JsError::from(e)),
        },
        Err(err) => Err(JsError::from(err)),
    }
}
