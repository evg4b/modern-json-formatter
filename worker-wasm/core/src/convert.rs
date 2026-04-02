use crate::node::Node;
use crate::parser::Factory;
use jaq_json::Val;

pub(crate) fn val_to_node(val: Val, factory: &impl Factory<Node>) -> Node {
    match val {
        Val::Null => factory.null(),
        Val::Bool(b) => factory.bool(b),
        Val::Num(n) => factory.number(n),
        Val::TStr(b) | Val::BStr(b) => factory.string(b.to_vec()),
        Val::Arr(items) => factory.array(
            items.iter().map(|i| val_to_node(i.clone(), factory)).collect(),
        ),
        Val::Obj(entries) => factory.object(
            entries
                .iter()
                .map(|(k, v)| (val_key_to_str(k), val_to_node(v.clone(), factory)))
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
