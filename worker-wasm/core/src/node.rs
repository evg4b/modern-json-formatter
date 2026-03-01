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
