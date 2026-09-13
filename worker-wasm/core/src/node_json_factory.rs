use jaq_json::Num;
use std::borrow::Cow;
use crate::{Node, Property};
use crate::parser::Factory;
use crate::utils::determine_variant;

pub struct NodeJsonFactory;

impl Factory<Node> for NodeJsonFactory {
    fn null(&self) -> Node {
        Node::Null
    }

    fn bool(&self, val: bool) -> Node {
        Node::Boolean { value: val }
    }

    fn number(&self, n: Num) -> Node {
        Node::Number { value: n.to_string() }
    }

    fn string(&self, s: Cow<'_, str>) -> Node {
        Node::String {
            variant: determine_variant(s.trim()),
            value: s.into_owned(),
        }
    }

    fn array(&self, arr: Vec<Node>) -> Node {
        Node::Array { items: arr }
    }

    fn object(&self, obj: Vec<(String, Node)>) -> Node {
        Node::Object {
            properties: obj.into_iter()
                .map(|(k, v)| Property { key: k, value: v })
                .collect(),
        }
    }

    fn tuple(&self, items: Vec<Node>) -> Node {
        Node::Tuple { items }
    }
}
