#[derive(Clone, Debug, PartialEq)]
pub struct Property {
    pub key: String,
    pub value: Node,
}

#[derive(Clone, Debug, PartialEq)]
pub enum StringVariant {
    Url,
    Email,
}

#[derive(Clone, Debug, PartialEq)]
pub enum Node {
    Null,
    Object {
        properties: Vec<Property>,
    },
    Array {
        items: Vec<Node>,
    },
    String {
        value: String,
        variant: Option<StringVariant>,
    },
    Number {
        value: String,
    },
    Boolean {
        value: bool,
    },
    Tuple {
        items: Vec<Node>,
    },
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};

    #[test]
    fn node_implements_clone() {
        let original = NodeJsonFactory.object(vec![
            ("x".to_string(), parse_json(b"1", NodeJsonFactory).unwrap()),
        ]);
        assert_eq!(original.clone(), original);
    }

    #[test]
    fn property_implements_clone() {
        let obj = NodeJsonFactory.object(vec![("key".to_string(), NodeJsonFactory.bool(true))]);
        assert_eq!(obj.clone(), obj);
    }

    #[test]
    fn string_variant_implements_clone_and_partial_eq() {
        assert_eq!(StringVariant::Url, StringVariant::Url.clone());
        assert_eq!(StringVariant::Email, StringVariant::Email.clone());
        assert_ne!(StringVariant::Url, StringVariant::Email);
    }
}
