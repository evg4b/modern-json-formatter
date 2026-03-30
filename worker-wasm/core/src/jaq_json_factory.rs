use std::rc::Rc;
use jaq_json::{Map, Num, Val};
use crate::parser::Factory;

pub struct JaqJsonFactory;

impl Factory<Val> for JaqJsonFactory {
    fn null(&self) -> Val {
        Val::Null
    }

    fn bool(&self, val: bool) -> Val {
        Val::Bool(val)
    }

    fn number(&self, n: Num) -> Val {
        Val::Num(n)
    }

    fn string(&self, s: Vec<u8>) -> Val {
        Val::utf8_str(s)
    }

    fn array(&self, arr: Vec<Val>) -> Val {
        Val::Arr(Rc::from(arr))
    }

    fn object(&self, obj: Vec<(String, Val)>) -> Val {
        Val::Obj(Rc::from(
            obj.into_iter()
                .map(|(k, v)| (Val::utf8_str(k.into_bytes()), v))
                .collect::<Map<Val, Val>>(),
        ))
    }
}
