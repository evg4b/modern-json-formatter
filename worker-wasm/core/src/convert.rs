use crate::node::Node;
use crate::node_json_factory::NodeJsonFactory;
use crate::utils::determinate_variant;
use jaq_json::Val;

pub(crate) fn val_to_node(val: Val) -> Node {
    match val {
        Val::Null => NodeJsonFactory::null(),
        Val::Bool(b) => NodeJsonFactory::bool(b),
        Val::Num(n) => NodeJsonFactory::number(&n.to_string()),
        Val::TStr(b) | Val::BStr(b) => {
            let s = String::from_utf8_lossy(&b);
            NodeJsonFactory::string(&s, determinate_variant(s.trim()))
        }
        Val::Arr(items) => NodeJsonFactory::array(
            items.iter().map(|i| val_to_node(i.clone())).collect(),
        ),
        Val::Obj(entries) => NodeJsonFactory::object(
            entries
                .iter()
                .map(|(k, v)| NodeJsonFactory::property(&val_key_to_str(k), val_to_node(v.clone())))
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
