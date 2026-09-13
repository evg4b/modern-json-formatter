use std::borrow::Cow;
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

    fn string(&self, s: Cow<'_, str>) -> Val {
        Val::utf8_str(s.into_owned().into_bytes())
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

    fn tuple(&self, _: Vec<Val>) -> Val {
        unreachable!("tuple is a Node-only concept and must not be called on JaqJsonFactory")
    }
}
