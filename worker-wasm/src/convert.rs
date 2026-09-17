use core::{Node, Property, StringVariant};
use js_sys::{Array, Object, Reflect};
use wasm_bindgen::JsValue;

/// The property keys and type tags of the node format, as JS strings.
///
/// Every node writes the same handful of them and each `JsValue::from_str` hands
/// a fresh string to JS, so they are created once and reused for the whole tree.
struct Names {
    r#type: JsValue,
    value: JsValue,
    variant: JsValue,
    items: JsValue,
    properties: JsValue,
    key: JsValue,
    null: JsValue,
    boolean: JsValue,
    number: JsValue,
    string: JsValue,
    array: JsValue,
    object: JsValue,
    tuple: JsValue,
    url: JsValue,
    email: JsValue,
}

impl Names {
    fn new() -> Self {
        Self {
            r#type: "type".into(),
            value: "value".into(),
            variant: "variant".into(),
            items: "items".into(),
            properties: "properties".into(),
            key: "key".into(),
            null: "null".into(),
            boolean: "boolean".into(),
            number: "number".into(),
            string: "string".into(),
            array: "array".into(),
            object: "object".into(),
            tuple: "tuple".into(),
            url: "url".into(),
            email: "email".into(),
        }
    }
}

thread_local! {
    static NAMES: Names = Names::new();
}

pub fn node_to_js_value(node: Node) -> JsValue {
    NAMES.with(|names| node_to_js(node, names))
}

fn node_to_js(node: Node, names: &Names) -> JsValue {
    let obj = Object::new();
    match node {
        Node::Null => set(&obj, &names.r#type, &names.null),
        Node::Boolean { value } => {
            set(&obj, &names.r#type, &names.boolean);
            set(&obj, &names.value, &JsValue::from_bool(value));
        }
        Node::Number { value } => {
            set(&obj, &names.r#type, &names.number);
            set(&obj, &names.value, &JsValue::from_str(&value));
        }
        Node::String { value, variant } => {
            set(&obj, &names.r#type, &names.string);
            set(&obj, &names.value, &JsValue::from_str(&value));
            if let Some(variant) = variant {
                set(&obj, &names.variant, variant_name(variant, names));
            }
        }
        Node::Array { items } => {
            set(&obj, &names.r#type, &names.array);
            set(&obj, &names.items, &items_to_js(items, names));
        }
        Node::Tuple { items } => {
            set(&obj, &names.r#type, &names.tuple);
            set(&obj, &names.items, &items_to_js(items, names));
        }
        Node::Object { properties } => {
            set(&obj, &names.r#type, &names.object);
            set(&obj, &names.properties, &properties_to_js(properties, names));
        }
    }
    obj.into()
}

fn variant_name(variant: StringVariant, names: &Names) -> &JsValue {
    match variant {
        StringVariant::Url => &names.url,
        StringVariant::Email => &names.email,
    }
}

fn items_to_js(items: Vec<Node>, names: &Names) -> JsValue {
    let arr = Array::new_with_length(items.len() as u32);
    for (index, item) in items.into_iter().enumerate() {
        arr.set(index as u32, node_to_js(item, names));
    }
    arr.into()
}

fn properties_to_js(properties: Vec<Property>, names: &Names) -> JsValue {
    let arr = Array::new_with_length(properties.len() as u32);
    for (index, property) in properties.into_iter().enumerate() {
        let obj = Object::new();
        set(&obj, &names.key, &JsValue::from_str(&property.key));
        set(&obj, &names.value, &node_to_js(property.value, names));
        arr.set(index as u32, obj.into());
    }
    arr.into()
}

/// Writing to an object we have just created cannot fail: there is no setter,
/// proxy or frozen target that could refuse the write.
fn set(obj: &Object, key: &JsValue, value: &JsValue) {
    let _ = Reflect::set(obj, key, value);
}
