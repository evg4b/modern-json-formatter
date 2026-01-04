use crate::node::{Property, ResultValue};
use jaq_core::{load, Compiler, Ctx, RcIter};
use jaq_json::Val;
use load::{Arena, File, Loader};
use serde_json::Value;
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsError, JsValue};

#[wasm_bindgen]
pub fn jq(json: &str, query: &str) -> Result<JsValue, JsError> {
    let input = serde_json::from_str::<Value>(json)?;
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

    let mut items: Vec<ResultValue> = vec![];

    for item in collection {
        match item {
            Ok(v) => items.push(to_return_value(v)),
            Err(e) => {
                return Err(JsError::new(&format!("Error: {}", e)));
            }
        }
    }

    Ok(to_value(&ResultValue::Tuple { items })?)
}

fn to_return_value(value: Val) -> ResultValue {
    match value {
        Val::Null => ResultValue::Null,
        Val::Bool(val) => ResultValue::Boolean { value: val },
        Val::Int(number) => ResultValue::Number {
            value: number.to_string(),
        },
        Val::Float(number) => ResultValue::Number {
            value: number.to_string(),
        },
        Val::Num(number) => ResultValue::Number {
            value: number.to_string(),
        },
        Val::Str(str) => ResultValue::String {
            value: str.to_string(),
            variant: None,
        },
        Val::Arr(items) => ResultValue::Array {
            items: items.iter()
                .map(|i| to_return_value(i.clone()))
                .collect(),
        },
        Val::Obj(items) => ResultValue::Object {
            properties: items.iter()
                .map(|(k, v)| Property {
                    key: k.to_string(),
                    value: to_return_value(v.clone()),
                })
                .collect(),
        },
    }
}
