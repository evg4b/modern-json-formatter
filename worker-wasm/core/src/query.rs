use crate::node::{Node, Property};
use crate::utils::determinate_variant;
use jaq_core::{Compiler, Ctx, RcIter, load};
use jaq_json::Val;
use load::{Arena, File, Loader};
use serde_json::Value;
use std::error::Error;
use json5::from_str;

fn to_return_value(value: Val) -> Node {
    match value {
        Val::Null => Node::Null,
        Val::Bool(bool) => Node::bool(bool),
        Val::Int(number) => Node::number(number.to_string().as_str()),
        Val::Float(number) => Node::number(number.to_string().as_str()),
        Val::Num(number) => Node::number(number.to_string().as_str()),
        Val::Str(str) => Node::string(str.as_str(), determinate_variant(str.as_str().trim())),
        Val::Arr(items) => Node::array(
            items.iter()
                .map(|i| to_return_value(i.clone()))
                .collect(),
        ),
        Val::Obj(items) => Node::object(
            items
                .iter()
                .map(|(k, v)| Property {
                    key: k.to_string(),
                    value: to_return_value(v.clone()),
                })
                .collect(),
        ),
    }
}

pub fn query_json(json: &str, query: &str) -> Result<Node, Box<dyn Error>> {
    let input = from_str::<Value>(json)?;
    let program = File {
        code: query,
        path: (),
    };

    let loader = Loader::new(jaq_std::defs().chain(jaq_json::defs()));
    let arena = Arena::default();

    let modules = loader.load(&arena, program).unwrap();

    let filter = Compiler::default()
        .with_funs(jaq_std::funs().chain(jaq_json::funs()))
        .compile(modules)
        .unwrap();

    let inputs = RcIter::new(core::iter::empty());

    let collection = filter.run((Ctx::new([], &inputs), Val::from(input)));

    let mut items: Vec<Node> = vec![];

    for item in collection {
        match item {
            Ok(v) => items.push(to_return_value(v)),
            Err(err) => {
                return Err(Box::from(err.to_string()));
            }
        }
    }

    Ok(Node::Tuple { items })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn query_json_works() {
        let json = r#"
        {
            "a": 1,
            "b": 2,
            "c": {
                "d": 3,
                "e": 4
            }
        }
        "#;

        let query = r#".a"#;
        let result = query_json(json, query).unwrap();
        assert_eq!(result, Node::Tuple { items: vec![Node::number("1")]});
    }

    #[test]
    fn query_json_with_comments() {
        let json = r#"
        {
            // comment before
            "a": 1,
            "b": 2 // comment after
        }
        "#;
        let query = r#".a"#;
        let result = query_json(json, query).unwrap();
        assert_eq!(result, Node::Tuple { items: vec![Node::number("1")] });
    }
}
