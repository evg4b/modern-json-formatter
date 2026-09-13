use crate::parser::{Factory, Number};
use crate::{Node, Property};
use std::borrow::Cow;

pub struct NodeJsonFactory;

impl Factory<Node> for NodeJsonFactory {
    type Members = Vec<Property>;

    fn null(&self) -> Node {
        Node::Null
    }

    fn bool(&self, value: bool) -> Node {
        Node::Boolean { value }
    }

    fn number(&self, number: Number<'_>) -> Node {
        Node::Number { value: number.text().to_owned() }
    }

    fn string(&self, value: Cow<'_, str>) -> Node {
        Node::string(value)
    }

    fn array(&self, items: Vec<Node>) -> Node {
        Node::Array { items }
    }

    fn insert(&self, members: &mut Vec<Property>, key: Cow<'_, str>, value: Node) {
        members.push(Property { key: key.into_owned(), value });
    }

    fn object(&self, members: Vec<Property>) -> Node {
        Node::Object { properties: members }
    }
}
