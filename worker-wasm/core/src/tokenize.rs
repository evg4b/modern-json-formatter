use crate::node::Node;
use crate::parser::{parse_json};
use std::error::Error;
use crate::node_json_factory::NodeJsonFactory;

pub fn tokenize_json(json: &str) -> Result<Node, Box<dyn Error>> {
    parse_json(json.as_bytes(), NodeJsonFactory)
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

    #[test]
    fn parses_boolean_true() {
        assert_eq!(tokenize_json("true").unwrap(), Node::Boolean { value: true });
    }

    #[test]
    fn parses_float_number() {
        assert_eq!(
            tokenize_json("3.14").unwrap(),
            Node::Number {
                value: "3.14".to_string(),
            },
        );
    }

    #[test]
    fn parses_negative_number() {
        assert_eq!(
            tokenize_json("-42").unwrap(),
            Node::Number {
                value: "-42".to_string(),
            },
        );
    }

    #[test]
    fn parses_empty_array() {
        assert_eq!(tokenize_json("[]").unwrap(), Node::array(vec![]));
    }

    #[test]
    fn parses_empty_string_value() {
        assert_eq!(tokenize_json(r#""""#).unwrap(), Node::string("", None));
    }

    #[test]
    fn fails_on_empty_input() {
        assert!(tokenize_json("").is_err());
    }

    #[test]
    fn fails_on_invalid_json() {
        assert!(tokenize_json("{invalid}").is_err());
    }
}
