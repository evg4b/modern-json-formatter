use crate::node::{Node, Property};
use crate::utils::determinate_variant;
use jaq_json::Val;

pub(crate) fn val_to_node(val: Val) -> Node {
    match val {
        Val::Null => Node::Null,
        Val::Bool(b) => Node::bool(b),
        Val::Num(n) => Node::number(&n.to_string()),
        Val::TStr(b) | Val::BStr(b) => {
            let s = String::from_utf8_lossy(&b);
            Node::string(s.as_ref(), determinate_variant(s.trim()))
        }
        Val::Arr(items) => Node::array(
            items.iter().map(|i| val_to_node(i.clone())).collect(),
        ),
        Val::Obj(entries) => Node::object(
            entries
                .iter()
                .map(|(k, v)| Property {
                    key: val_key_to_str(k),
                    value: val_to_node(v.clone()),
                })
                .collect(),
        ),
    }
}

fn val_key_to_str(k: &Val) -> String {
    match k {
        Val::TStr(b) | Val::BStr(b) => String::from_utf8_lossy(b).into_owned(),
        _ => k.to_string(),
    }
}
