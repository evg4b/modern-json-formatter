use crate::parser::{Factory, Number};
use jaq_json::{Map, Num, Val};
use std::borrow::Cow;
use std::rc::Rc;

pub struct JaqJsonFactory;

impl Factory<Val> for JaqJsonFactory {
    type Members = Map<Val, Val>;

    fn null(&self) -> Val {
        Val::Null
    }

    fn bool(&self, value: bool) -> Val {
        Val::Bool(value)
    }

    fn number(&self, number: Number<'_>) -> Val {
        Val::Num(match number {
            // `from_str_radix` only fails on input that is not all digits.
            Number::Int(text) => Num::from_str_radix(text, 10).unwrap_or_else(|| decimal(text)),
            Number::Dec(text) => decimal(text),
            Number::NonFinite(value) => Num::Float(value),
        })
    }

    fn string(&self, value: Cow<'_, str>) -> Val {
        Val::utf8_str(value.into_owned().into_bytes())
    }

    fn array(&self, items: Vec<Val>) -> Val {
        Val::Arr(Rc::new(items))
    }

    fn insert(&self, members: &mut Map<Val, Val>, key: Cow<'_, str>, value: Val) {
        members.insert(self.string(key), value);
    }

    fn object(&self, members: Map<Val, Val>) -> Val {
        Val::Obj(Rc::new(members))
    }
}

/// A number kept as text, which is how jq preserves arbitrary precision.
fn decimal(text: &str) -> Num {
    Num::Dec(Rc::new(text.to_owned()))
}
