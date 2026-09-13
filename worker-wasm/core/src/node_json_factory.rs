use crate::parser::{Factory, Number};
use crate::{Node, Property};
use std::borrow::Cow;

pub struct NodeJsonFactory;

impl Factory<Node> for NodeJsonFactory {
    type Members = Vec<Property>;

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

    fn insert(&self, members: &mut Vec<Property>, key: Cow<'_, str>, value: Node) {
        members.push(Property { key: key.into_owned(), value });
    }

    fn object(&self, members: Vec<Property>) -> Node {
        Node::Object { properties: members }
    }
}
