use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Property {
    pub key: String,
    pub value: Node,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")] // для enum с разными вариантами
pub enum StringVariant {
    Url,
    Email
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
