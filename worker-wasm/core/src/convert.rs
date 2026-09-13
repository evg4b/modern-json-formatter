use crate::node::{Node, Property};
use jaq_json::Val;
use std::rc::Rc;

/// Convert a value produced by a jq query into a display node.
pub(crate) fn val_to_node(val: Val) -> Node {
    match val {
        Val::Null => Node::Null,
        Val::Bool(value) => Node::Boolean { value },
        Val::Num(n) => Node::Number { value: n.to_string() },
        Val::TStr(b) | Val::BStr(b) => Node::string(String::from_utf8_lossy(&b)),
        Val::Arr(items) => Node::Array {
            items: Rc::unwrap_or_clone(items).into_iter().map(val_to_node).collect(),
        },
        Val::Obj(members) => Node::Object {
            properties: Rc::unwrap_or_clone(members)
                .into_iter()
                .map(|(key, value)| Property {
                    key: key_to_string(key),
                    value: val_to_node(value),
                })
                .collect(),
        },
    }
}

/// jq allows any value as an object key, but a property key is always text.
fn key_to_string(key: Val) -> String {
    match key {
        Val::TStr(b) | Val::BStr(b) => String::from_utf8_lossy(&b).into_owned(),
        key => key.to_string(),
    }
}
