use crate::parser::{Factory, Number};
use crate::{Node, Property};
use std::borrow::Cow;

pub struct NodeJsonFactory;

impl Factory<Node> for NodeJsonFactory {
    fn null(&self) -> Node {
        Node::Null
    }

    fn bool(&self, val: bool) -> Node {
        Node::Boolean { value: val }
    }

    fn number(&self, n: Number<'_>) -> Node {
        Node::Number { value: n.text().to_owned() }
    }

    fn string(&self, s: Cow<'_, str>) -> Node {
        Node::string(s)
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
