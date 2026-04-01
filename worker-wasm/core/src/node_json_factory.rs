use jaq_json::Num;
use crate::{Node, Property};
use crate::node::StringVariant;
use crate::parser::Factory;
use crate::utils::determinate_variant;

pub struct NodeJsonFactory;

impl NodeJsonFactory {
    pub fn null() -> Node {
        Node::Null
    }

    pub fn bool(value: bool) -> Node {
        Node::Boolean { value }
    }

    pub fn number(value: &str) -> Node {
        Node::Number { value: value.to_string() }
    }

    pub fn string(value: &str, variant: Option<StringVariant>) -> Node {
        Node::String { value: value.to_string(), variant }
    }

    pub fn array(items: Vec<Node>) -> Node {
        Node::Array { items }
    }

    pub fn object(properties: Vec<Property>) -> Node {
        Node::Object { properties }
    }

    pub fn tuple(items: Vec<Node>) -> Node {
        Node::Tuple { items }
    }

    pub fn property(key: &str, value: Node) -> Property {
        Property { key: key.to_string(), value }
    }
}

impl Factory<Node> for NodeJsonFactory {
    fn null(&self) -> Node {
        NodeJsonFactory::null()
    }

    fn bool(&self, val: bool) -> Node {
        NodeJsonFactory::bool(val)
    }

    fn number(&self, n: Num) -> Node {
        NodeJsonFactory::number(&n.to_string())
    }

    fn string(&self, s: Vec<u8>) -> Node {
        let string = String::from_utf8_lossy(&s);
        NodeJsonFactory::string(&string, determinate_variant(string.trim()))
    }

    fn array(&self, arr: Vec<Node>) -> Node {
        NodeJsonFactory::array(arr)
    }

    fn object(&self, obj: Vec<(String, Node)>) -> Node {
        NodeJsonFactory::object(
            obj.into_iter()
                .map(|(k, v)| NodeJsonFactory::property(&k, v))
                .collect(),
        )
    }
}
