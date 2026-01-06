use crate::node::{Property, Node, StringVariant};
use email_address::EmailAddress;
use json_event_parser::{JsonEvent, ReaderJsonParser};
use serde_wasm_bindgen::to_value;
use std::io::{Cursor, Error};
use url::Url;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

fn is_url(value: &str) -> bool {
    let url = match Url::parse(value) {
        Ok(url) => url,
        Err(_) => return false,
    };

    matches!(url.scheme(), "http" | "https" | "ftp" | "mailto")
}

fn determinate_variant(string: &str) -> Option<StringVariant> {
    if is_url(string) {
        return Some(StringVariant::Url);
    }

    if EmailAddress::is_valid(string) {
        return Some(StringVariant::Email);
    }

    None
}

fn tokenize_value<R: std::io::Read>(
    parser: &mut ReaderJsonParser<R>,
) -> Result<Option<Node>, Error> {
    match parser.parse_next()? {
        JsonEvent::String(value) => Ok(Some(Node::String {
            value: value.to_string(),
            variant: determinate_variant(value.trim()),
        })),
        JsonEvent::Number(value) => Ok(Some(Node::Number {
            value: value.to_string(),
        })),
        JsonEvent::Boolean(value) => Ok(Some(Node::Boolean { value })),
        JsonEvent::Null => Ok(Some(Node::Null)),
        JsonEvent::StartArray => {
            let mut items = vec![];
            loop {
                match tokenize_value(parser)? {
                    Some(value) => items.push(value),
                    None => break,
                }
            }
            Ok(Some(Node::Array { items: vec![] }))
        }
        JsonEvent::StartObject => {
            let mut properties = vec![];
            loop {
                let key = match parser.parse_next()? {
                    JsonEvent::ObjectKey(key) => key.to_string(),
                    JsonEvent::EndObject => break,
                    _ => {
                        return Err(Error::new(
                            std::io::ErrorKind::InvalidData,
                            "Expected object key or end of object",
                        ))
                    }
                };
                match tokenize_value(parser)? {
                    Some(value) => properties.push(Property { key, value }),
                    None => {
                        return Err(Error::new(
                            std::io::ErrorKind::InvalidData,
                            "Expected value after object key",
                        ))
                    }
                }
            }
            Ok(Some(Node::Object { properties }))
        }
        JsonEvent::ObjectKey(_) => Ok(None),
        JsonEvent::EndArray | JsonEvent::EndObject | JsonEvent::Eof => Ok(None),
    }
}

#[wasm_bindgen]
pub fn tokenize(json: &str) -> Result<JsValue, JsError> {
    let mut parser = ReaderJsonParser::new(Cursor::new(json.as_bytes()));

    match tokenize_value(&mut parser)? {
        Some(value) => Ok(to_value(&value).map_err(|e| JsError::from(e))?),
        None => Err(JsError::from(Error::new(
            std::io::ErrorKind::InvalidData,
            "No value found",
        ))),
    }
}
