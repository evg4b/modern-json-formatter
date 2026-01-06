use crate::node::Node;
use crate::utils::determinate_variant;
use json_event_parser::{JsonEvent, ReaderJsonParser};
use std::error::Error;
use std::io::{Cursor, Error as StdError};

fn tokenize_value<R: std::io::Read>(
    parser: &mut ReaderJsonParser<R>,
) -> Result<Option<Node>, Box<dyn Error>> {
    match parser.parse_next()? {
        JsonEvent::String(value) => Ok(Some(Node::String {
            value: value.to_string(),
            variant: determinate_variant(value.trim()),
        })),
        JsonEvent::Number(value) => Ok(Some(Node::Number {
            value: value.to_string(),
        })),
        JsonEvent::Boolean(value) => Ok(Some(Node::bool(value))),
        JsonEvent::Null => Ok(Some(Node::Null)),
        JsonEvent::StartArray => {
            let mut items = vec![];
            loop {
                match tokenize_value(parser)? {
                    Some(value) => items.push(value),
                    None => break,
                }
            }
            Ok(Some(Node::array(items)))
        }
        JsonEvent::StartObject => {
            let mut properties = vec![];
            loop {
                let key = match parser.parse_next()? {
                    JsonEvent::ObjectKey(key) => key.to_string(),
                    JsonEvent::EndObject => break,
                    _ => {
                        return Err(Box::new(StdError::new(
                            std::io::ErrorKind::InvalidData,
                            "Expected object key or end of object",
                        )));
                    }
                };
                match tokenize_value(parser)? {
                    Some(value) => properties.push(Node::property(key.as_str(), value)),
                    None => {
                        return Err(Box::from(StdError::new(
                            std::io::ErrorKind::InvalidData,
                            "Expected value after object key",
                        )));
                    }
                }
            }
            Ok(Some(Node::object(properties)))
        }
        JsonEvent::ObjectKey(_) => Ok(None),
        JsonEvent::EndArray | JsonEvent::EndObject | JsonEvent::Eof => Ok(None),
    }
}

pub fn tokenize_json(json: &str) -> Result<Node, Box<dyn std::error::Error>> {
    let mut parser = ReaderJsonParser::new(Cursor::new(json.as_bytes()));
    match tokenize_value(&mut parser)? {
        Some(node) => Ok(node),
        None => Err(Box::new(StdError::new(
            std::io::ErrorKind::InvalidData,
            "No valid JSON value found",
        ))),
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::node::{Node, StringVariant};

    #[test]
    fn parses_string_with_url_variant() {
        let json = r#""https://example.com""#;

        match tokenize_json(json).unwrap() {
            Node::String { variant, .. } => {
                assert_eq!(variant, Some(StringVariant::Url));
            }
            _ => panic!("Expected string"),
        }
    }

    #[test]
    fn parses_string_with_email_variant() {
        let json = r#""user@example.com""#;

        match tokenize_json(json).unwrap() {
            Node::String { variant, .. } => {
                assert_eq!(variant, Some(StringVariant::Email));
            }
            _ => panic!("Expected string"),
        }
    }

    #[test]
    fn parses_string_without_variant() {
        let json = r#""plain text""#;

        match tokenize_json(json).unwrap() {
            Node::String { variant, .. } => {
                assert_eq!(variant, None);
            }
            _ => panic!("Expected string"),
        }
    }

    #[test]
    fn parses_number_boolean_and_null() {
        assert!(matches!(tokenize_json("42").unwrap(), Node::Number { .. }));

        assert!(matches!(
            tokenize_json("false").unwrap(),
            Node::Boolean { value: false }
        ));

        assert!(matches!(tokenize_json("null").unwrap(), Node::Null));
    }

    #[test]
    fn parses_array_and_hits_end_array() {
        let json = r#"[1, "a", true]"#;

        match tokenize_json(json).unwrap() {
            Node::Array { .. } => {}
            _ => panic!("Expected array"),
        }
    }

    #[test]
    fn parses_object_and_properties() {
        let json = r#"{ "a": 1, "b": "x" }"#;

        match tokenize_json(json).unwrap() {
            Node::Object { properties } => {
                assert_eq!(properties.len(), 2);
            }
            _ => panic!("Expected object"),
        }
    }

    #[test]
    fn parses_nested_arrays_and_objects() {
        let json = r#"
    {
        "users": [
            {
                "id": 1,
                "email": "user@example.com"
            },
            {
                "id": 2,
                "url": "https://example.com"
            }
        ],
        "active": true
    }
    "#;

        let node = tokenize_json(json).unwrap();

        assert_eq!(
            node,
            Node::object(vec![
                Node::property(
                    "users",
                    Node::array(vec![
                        Node::object(vec![
                            Node::property("id", Node::number("1")),
                            Node::property(
                                "email",
                                Node::string("user@example.com", Some(StringVariant::Email))
                            ),
                        ]),
                        Node::object(vec![
                            Node::property("id", Node::number("2")),
                            Node::property(
                                "url",
                                Node::string("https://example.com", Some(StringVariant::Url))
                            ),
                        ]),
                    ]),
                ),
                Node::property("active", Node::bool(true))
            ])
        )
    }

    #[test]
    fn parses_nested_arrays_and_objects_s() {
        let json = r#"[{}]"#;

        let node = tokenize_json(json).unwrap();

        assert_eq!(node, Node::array(vec![Node::object(vec![])]))
    }
}
