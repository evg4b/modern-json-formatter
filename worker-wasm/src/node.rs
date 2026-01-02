use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Property {
    pub key: String,
    pub value: ResultValue,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "value", rename_all = "lowercase")] // для enum с разными вариантами
pub enum ResultValue {
    Null,
    Object(Vec<Property>),
    Array(Vec<ResultValue>),
    String {
        value: String,
        variant: Option<String>,
    },
    Number(String),
    Boolean(bool),
    Tuple(Vec<ResultValue>),
}
