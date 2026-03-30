use core::{Node, Property, StringVariant};
use js_sys::{Array, Object, Reflect};
use wasm_bindgen::{JsError, JsValue};

pub fn node_to_jsvalue(node: Node) -> Result<JsValue, JsError> {
    let obj = Object::new();
    match node {
        Node::Null => {
            set_str(&obj, "type", "null")?;
        }
        Node::Boolean { value } => {
            set_str(&obj, "type", "boolean")?;
            set_val(&obj, "value", JsValue::from_bool(value))?;
        }
        Node::Number { value } => {
            set_str(&obj, "type", "number")?;
            set_str(&obj, "value", &value)?;
        }
        Node::String { value, variant } => {
            set_str(&obj, "type", "string")?;
            set_str(&obj, "value", &value)?;
            if let Some(v) = variant {
                set_str(&obj, "variant", variant_str(v))?;
            }
        }
        Node::Array { items } => {
            set_str(&obj, "type", "array")?;
            set_val(&obj, "items", nodes_to_jsarray(items)?)?;
        }
        Node::Object { properties } => {
            set_str(&obj, "type", "object")?;
            set_val(&obj, "properties", properties_to_jsarray(properties)?)?;
        }
        Node::Tuple { items } => {
            set_str(&obj, "type", "tuple")?;
            set_val(&obj, "items", nodes_to_jsarray(items)?)?;
        }
    }
    Ok(obj.into())
}

fn variant_str(v: StringVariant) -> &'static str {
    match v {
        StringVariant::Url => "url",
        StringVariant::Email => "email",
    }
}

fn nodes_to_jsarray(items: Vec<Node>) -> Result<JsValue, JsError> {
    let arr = Array::new();
    for item in items {
        arr.push(&node_to_jsvalue(item)?);
    }
    Ok(arr.into())
}

fn properties_to_jsarray(properties: Vec<Property>) -> Result<JsValue, JsError> {
    let arr = Array::new();
    for prop in properties {
        let obj = Object::new();
        set_str(&obj, "key", &prop.key)?;
        set_val(&obj, "value", node_to_jsvalue(prop.value)?)?;
        arr.push(&obj);
    }
    Ok(arr.into())
}

fn set_str(obj: &Object, key: &str, value: &str) -> Result<(), JsError> {
    Reflect::set(obj, &JsValue::from_str(key), &JsValue::from_str(value))
        .map(|_| ())
        .map_err(|_| JsError::new("failed to set property on object"))
}

fn set_val(obj: &Object, key: &str, value: JsValue) -> Result<(), JsError> {
    Reflect::set(obj, &JsValue::from_str(key), &value)
        .map(|_| ())
        .map_err(|_| JsError::new("failed to set property on object"))
}
