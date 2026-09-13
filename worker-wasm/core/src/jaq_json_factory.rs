use std::borrow::Cow;
use std::rc::Rc;
use jaq_json::{Map, Num, Val};
use crate::parser::{Factory, Number};

pub struct JaqJsonFactory;

impl Factory<Val> for JaqJsonFactory {
    type Members = Map<Val, Val>;

    fn null(&self) -> Val {
        Val::Null
    }

    fn bool(&self, val: bool) -> Val {
        Val::Bool(val)
    }

    fn number(&self, n: Number<'_>) -> Val {
        Val::Num(match n {
            // `from_str_radix` only fails on input that is not all digits.
            Number::Int(text) => {
                Num::from_str_radix(text, 10).unwrap_or_else(|| decimal(text))
            }
            Number::Dec(text) => decimal(text),
            Number::NonFinite(n) => Num::Float(n),
        })
    }

    fn string(&self, s: Cow<'_, str>) -> Val {
        Val::utf8_str(s.into_owned().into_bytes())
    }

    fn array(&self, arr: Vec<Val>) -> Val {
        Val::Arr(Rc::from(arr))
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
