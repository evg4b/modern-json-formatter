use crate::utils::determine_variant;
use std::borrow::Cow;

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

impl Node {
    /// A string node, tagged with the variant it looks like (a URL, an e-mail).
    pub(crate) fn string(value: Cow<'_, str>) -> Self {
        Self::String {
            variant: determine_variant(&value),
            value: value.into_owned(),
        }
    }

    /// Wraps the values that a single jq query produced.
    pub(crate) fn tuple(items: Vec<Self>) -> Self {
        Self::Tuple { items }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_the_variant_of_a_string() {
        assert_eq!(
            Node::string("https://example.com".into()),
            Node::String {
                value: "https://example.com".to_string(),
                variant: Some(StringVariant::Url),
            },
        );
        assert_eq!(
            Node::string("plain".into()),
            Node::String { value: "plain".to_string(), variant: None },
        );
    }

    #[test]
    fn clones_whole_trees() {
        let node = Node::tuple(vec![Node::Object {
            properties: vec![Property {
                key: "x".to_string(),
                value: Node::Array { items: vec![Node::Boolean { value: true }, Node::Null] },
            }],
        }]);

        assert_eq!(node.clone(), node);
    }

    #[test]
    fn string_variants_compare_by_value() {
        assert_eq!(StringVariant::Url, StringVariant::Url.clone());
        assert_ne!(StringVariant::Url, StringVariant::Email);
    }
}
