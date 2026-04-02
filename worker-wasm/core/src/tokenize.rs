use crate::node::Node;
use crate::parser::parse_json;
use std::error::Error;
use crate::node_json_factory::NodeJsonFactory;

pub fn tokenize_json(json: &str) -> Result<Node, Box<dyn Error>> {
    parse_json(json.as_bytes(), NodeJsonFactory)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::node::{Node, StringVariant};
    use crate::parser::Factory;

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
            NodeJsonFactory.object(vec![
                ("users".to_string(), NodeJsonFactory.array(vec![
                    NodeJsonFactory.object(vec![
                        ("id".to_string(), parse_json(b"1", NodeJsonFactory).unwrap()),
                        ("email".to_string(), NodeJsonFactory.string(b"user@example.com".to_vec())),
                    ]),
                    NodeJsonFactory.object(vec![
                        ("id".to_string(), parse_json(b"2", NodeJsonFactory).unwrap()),
                        ("url".to_string(), NodeJsonFactory.string(b"https://example.com".to_vec())),
                    ]),
                ])),
                ("active".to_string(), NodeJsonFactory.bool(true)),
            ])
        )
    }

    #[test]
    fn parses_nested_arrays_and_objects_s() {
        let json = r#"[{}]"#;

        let node = tokenize_json(json).unwrap();

        assert_eq!(node, NodeJsonFactory.array(vec![NodeJsonFactory.object(vec![])]))
    }

    #[test]
    fn parses_boolean_true() {
        assert_eq!(tokenize_json("true").unwrap(), NodeJsonFactory.bool(true));
    }

    #[test]
    fn parses_float_number() {
        assert_eq!(tokenize_json("3.14").unwrap(), parse_json(b"3.14", NodeJsonFactory).unwrap());
    }

    #[test]
    fn parses_negative_number() {
        assert_eq!(tokenize_json("-42").unwrap(), parse_json(b"-42", NodeJsonFactory).unwrap());
    }

    #[test]
    fn parses_empty_array() {
        assert_eq!(tokenize_json("[]").unwrap(), NodeJsonFactory.array(vec![]));
    }

    #[test]
    fn parses_empty_string_value() {
        assert_eq!(tokenize_json(r#""""#).unwrap(), NodeJsonFactory.string(b"".to_vec()));
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
