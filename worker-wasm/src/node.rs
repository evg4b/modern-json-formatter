use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Property {
    pub key: String,
    pub value: ResultValue,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")] // для enum с разными вариантами
pub enum ResultValue {
    Null,
    Object {
        properties: Vec<Property>,
    },
    Array {
        items: Vec<ResultValue>,
    },
    String {
        value: String,
        variant: Option<String>,
    },
    Number {
        value: String,
    },
    Boolean {
        value: bool,
    },
    Tuple {
        items: Vec<ResultValue>,
    },
}
