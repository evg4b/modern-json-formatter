use jaq_json::Num;
use crate::{Node, Property};
use crate::parser::Factory;
use crate::utils::determinate_variant;

pub struct NodeJsonFactory;

pub trait NodeFactory: Factory<Node> {
    fn tuple(&self, items: Vec<Node>) -> Node;
}

impl NodeFactory for NodeJsonFactory {
    fn tuple(&self, items: Vec<Node>) -> Node {
        Node::Tuple { items }
    }
}

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

    fn string(&self, s: Vec<u8>) -> Node {
        let string = String::from_utf8_lossy(&s);
        Node::String {
            value: string.to_string(),
            variant: determinate_variant(string.trim()),
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
}
