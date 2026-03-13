use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Property {
    pub key: String,
    pub value: Node,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StringVariant {
    Url,
    Email,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Node {
    Null,
    Object {
        properties: Vec<Property>,
    },
    Array {
        items: Vec<Node>,
    },
    String {
        value: String,
        variant: Option<StringVariant>,
    },
    Number {
        value: String,
    },
    Boolean {
        value: bool,
    },
    Tuple {
        items: Vec<Node>,
    },
}

impl Node {
    pub fn bool(value: bool) -> Node {
        Node::Boolean { value }
    }

    pub fn property(key: &str, value: Node) -> Property {
        Property {
            key: key.to_string(),
            value,
        }
    }

    pub fn string(value: &str, variant: Option<StringVariant>) -> Node {
        Node::String {
            value: value.to_string(),
            variant,
        }
    }

    pub fn number(value: &str) -> Node {
        Node::Number {
            value: value.to_string(),
        }
    }

    pub fn array(items: Vec<Node>) -> Node {
        Node::Array { items }
    }

    pub fn object(properties: Vec<Property>) -> Node {
        Node::Object { properties }
    }

    pub fn tuple(items: Vec<Node>) -> Node {
        Node::Tuple { items }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bool_true_constructs_correct_node() {
        assert_eq!(Node::bool(true), Node::Boolean { value: true });
    }

    #[test]
    fn bool_false_constructs_correct_node() {
        assert_eq!(Node::bool(false), Node::Boolean { value: false });
    }

    #[test]
    fn number_constructs_correct_node() {
        assert_eq!(
            Node::number("42"),
            Node::Number {
                value: "42".to_string(),
            },
        );
    }

    #[test]
    fn string_without_variant_constructs_correct_node() {
        assert_eq!(
            Node::string("hello", None),
            Node::String {
                value: "hello".to_string(),
                variant: None,
            },
        );
    }

    #[test]
    fn string_with_url_variant_constructs_correct_node() {
        assert_eq!(
            Node::string("https://example.com", Some(StringVariant::Url)),
            Node::String {
                value: "https://example.com".to_string(),
                variant: Some(StringVariant::Url),
            },
        );
    }

    #[test]
    fn string_with_email_variant_constructs_correct_node() {
        assert_eq!(
            Node::string("user@example.com", Some(StringVariant::Email)),
            Node::String {
                value: "user@example.com".to_string(),
                variant: Some(StringVariant::Email),
            },
        );
    }

    #[test]
    fn array_constructs_correct_node() {
        let items = vec![Node::Null, Node::bool(true)];
        assert_eq!(Node::array(items.clone()), Node::Array { items });
    }

    #[test]
    fn object_constructs_correct_node() {
        let properties = vec![Node::property("key", Node::Null)];
        assert_eq!(
            Node::object(properties.clone()),
            Node::Object { properties },
        );
    }

    #[test]
    fn tuple_constructs_correct_node() {
        let items = vec![Node::number("1"), Node::bool(false)];
        assert_eq!(Node::tuple(items.clone()), Node::Tuple { items });
    }

    #[test]
    fn property_constructs_correct_struct() {
        let prop = Node::property("name", Node::number("1"));
        assert_eq!(prop.key, "name");
        assert_eq!(prop.value, Node::number("1"));
    }

    #[test]
    fn node_implements_clone() {
        let original = Node::object(vec![Node::property("x", Node::number("1"))]);
        assert_eq!(original.clone(), original);
    }

    #[test]
    fn property_implements_clone() {
        let prop = Node::property("key", Node::bool(true));
        assert_eq!(prop.clone(), prop);
    }

    #[test]
    fn string_variant_implements_clone_and_partial_eq() {
        assert_eq!(StringVariant::Url, StringVariant::Url.clone());
        assert_eq!(StringVariant::Email, StringVariant::Email.clone());
        assert_ne!(StringVariant::Url, StringVariant::Email);
    }
}
