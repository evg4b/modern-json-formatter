use std::error::Error;
use crate::node::{Node, Property};
use crate::utils::determinate_variant;
use jaq_core::{Compiler, Ctx, Vars, data, load, unwrap_valr};
use jaq_json::{Map, Num, Val};
use load::{Arena, File, Loader};
use serde_json::Value;
use hifijson::{Expect, LexAlloc, SliceLexer};
use hifijson::token::Lex;

fn val_key_to_string(k: &Val) -> String {
    match k {
        Val::TStr(b) | Val::BStr(b) => String::from_utf8_lossy(b).into_owned(),
        _ => k.to_string(),
    }
}

fn serde_json_to_val(value: Value) -> Val {
    match value {
        Value::Null => Val::Null,
        Value::Bool(b) => Val::Bool(b),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                Val::Num(Num::from_integral(i))
            } else {
                Val::Num(Num::Float(n.as_f64().unwrap_or(f64::NAN)))
            }
        }
        Value::String(s) => Val::utf8_str(s.into_bytes()),
        Value::Array(arr) => arr.into_iter().map(serde_json_to_val).collect(),
        Value::Object(obj) => {
            let m = obj
                .into_iter()
                .map(|(k, v)| (Val::utf8_str(k.into_bytes()), serde_json_to_val(v)))
                .collect();
            Val::obj(m)
        }
    }
}

fn to_return_value(value: Val) -> Node {
    match value {
        Val::Null => Node::Null,
        Val::Bool(bool) => Node::bool(bool),
        Val::Num(number) => Node::number(number.to_string().as_str()),
        Val::TStr(b) | Val::BStr(b) => {
            let s = String::from_utf8_lossy(&b);
            Node::string(s.as_ref(), determinate_variant(s.trim()))
        }
        Val::Arr(items) => Node::array(items.iter().map(|i| to_return_value(i.clone())).collect()),
        Val::Obj(items) => Node::object(
            items
                .iter()
                .map(|(k, v)| Property {
                    key: val_key_to_string(k),
                    value: to_return_value(v.clone()),
                })
                .collect(),
        ),
    }
}

fn format_load_error(e: &load::Error<&str>) -> String {
    match e {
        load::Error::Lex(errs) => errs
            .iter()
            .map(|(expected, found)| {
                let ch = found.chars().next().map(|c| format!("'{c}'")).unwrap_or_else(|| "end of input".to_string());
                match expected {
                    load::lex::Expect::Token => format!("unexpected character {ch}"),
                    _ => format!("unexpected {ch}, expected {}", expected.as_str()),
                }
            })
            .collect::<Vec<_>>()
            .join("; "),
        load::Error::Parse(errs) => errs
            .iter()
            .map(|(expected, found)| {
                let found_desc = if found.is_empty() {
                    "end of input".to_string()
                } else {
                    format!("'{found}'")
                };
                format!("unexpected {found_desc}, expected {}", expected.as_str())
            })
            .collect::<Vec<_>>()
            .join("; "),
        load::Error::Io(errs) => errs
            .iter()
            .map(|(path, err)| format!("cannot load '{path}': {err}"))
            .collect::<Vec<_>>()
            .join("; "),
    }
}

fn parse_json_to_val(json: &str) -> Result<Val, Box<dyn Error>> {
    match parse_single(json.as_bytes()) {
        Ok(vall) => Ok(vall),
        Err(err) => Err(Box::<dyn Error>::from(err.to_string())),
    }
}

fn ws_tk<L: Lex>(lexer: &mut L) -> Option<u8> {
    loop {
        lexer.eat_whitespace();
        match lexer.peek_next() {
            Some(b'#') => lexer.skip_until(|c| c == b'\n'),
            next => return next,
        }
    }
}

pub fn parse_single(slice: &[u8]) -> Result<Val, Box<dyn Error>> {
    let offset = |rest: &[u8]| rest.as_ptr() as usize - slice.as_ptr() as usize;
    let mut lexer = SliceLexer::new(slice);
    lexer
        .exactly_one(ws_tk, parse)
        .map_err(|e| {
            // jaq_json::read::Error(offset(lexer.as_slice()), e)
            Box::<dyn Error>::from("ERRROR".to_string())
        })
}

fn parse<L: LexAlloc>(next: u8, lexer: &mut L) -> Result<Val, hifijson::Error> {
    Ok(match next {
        b'n' if lexer.strip_prefix(b"null") => Val::Null,
        b't' if lexer.strip_prefix(b"true") => Val::Bool(true),
        b'f' if lexer.strip_prefix(b"false") => Val::Bool(false),
        b'b' if lexer.strip_prefix(b"b\"") => Val::byte_str(parse_string(lexer, true)?),
        b'N' if lexer.strip_prefix(b"NaN") => Val::Num(Num::Float(f64::NAN)),
        b'I' if lexer.strip_prefix(b"Infinity") => Val::Num(Num::Float(f64::INFINITY)),
        b'0'..=b'9' | b'+' | b'-' => Val::Num(parse_num(lexer)?),
        b'"' => Val::utf8_str(parse_string(lexer.discarded(), false)?),
        b'[' => Val::Arr({
            let mut arr = Vec::new();
            lexer.discarded().seq(b']', ws_tk, |next, lexer| {
                arr.push(parse(next, lexer)?);
                Ok::<_, hifijson::Error>(())
            })?;
            arr.into()
        }),
        b'{' => Val::obj({
            let mut obj = Map::default();
            lexer.discarded().seq(b'}', ws_tk, |next, lexer| {
                let key = parse(next, lexer)?;
                lexer.expect(ws_tk, b':').ok_or(Expect::Colon)?;
                let value = parse(ws_tk(lexer).ok_or(Expect::Value)?, lexer)?;
                obj.insert(key, value);
                Ok::<_, hifijson::Error>(())
            })?;
            obj
        }),
        _ => Err(Expect::Value)?,
    })
}


/// Parse a JSON string as byte or text string, preserving invalid UTF-8 as-is.
fn parse_string<L: LexAlloc>(lexer: &mut L, bytes: bool) -> Result<Vec<u8>, hifijson::Error> {
    let on_string = |bytes: &mut L::Bytes, out: &mut Vec<u8>| {
        out.extend(bytes.as_ref());
        Ok(())
    };
    let s = lexer.str_fold(Vec::new(), on_string, |lexer, out| {
        use hifijson::escape::Error;
        match lexer.take_next().ok_or(Error::Eof)? {
            b'u' if bytes => Err(Error::InvalidKind(b'u'))?,
            b'x' if bytes => out.push(lexer.hex()?),
            c => out.extend(lexer.escape(c)?.encode_utf8(&mut [0; 4]).as_bytes()),
        }
        Ok(())
    });
    s.map_err(hifijson::Error::Str)
}

fn parse_num<L: LexAlloc>(lexer: &mut L) -> Result<Num, hifijson::Error> {
    let num = hifijson::num::Num::signed_digits();
    let (num, parts) = lexer.num_string_with(num).unvalidated();
    let num = num.as_ref();
    Ok(match num {
        "+" if lexer.strip_prefix(b"Infinity") => Num::Float(f64::INFINITY),
        "-" if lexer.strip_prefix(b"Infinity") => Num::Float(f64::NEG_INFINITY),
        _ if num.ends_with(|c: char| c.is_ascii_digit()) => {
            if parts.is_int() {
                Num::from_str_radix(num, 10).unwrap()
            } else {
                Num::Dec(num.to_string().into())
            }
        }
        _ => Err(hifijson::num::Error::ExpectedDigit)?,
    })
}

pub fn query_json(json: &str, query: &str) -> Result<Node, Box<dyn Error>> {
    let input = parse_json_to_val(json)?;
    let program = File {
        code: query,
        path: (),
    };

    let loader = Loader::new(jaq_core::defs().chain(jaq_std::defs()).chain(jaq_json::defs()));
    let arena = Arena::default();

    let modules = loader
        .load(&arena, program)
        .map_err(|errors| {
            let messages: Vec<String> = errors.iter().map(|(_, e)| format_load_error(e)).collect();
            Box::<dyn Error>::from(messages.join("; "))
        })?;

    let filter: jaq_core::Filter<data::JustLut<Val>> = Compiler::default()
        .with_funs(jaq_core::funs::<data::JustLut<Val>>().chain(jaq_std::funs::<data::JustLut<Val>>()).chain(jaq_json::funs::<data::JustLut<Val>>()))
        .compile(modules)
        .map_err(|errors| {
            let messages: Vec<String> = errors
                .iter()
                .flat_map(|(_, errs)| {
                    errs.iter().map(|(name, undef)| format!("undefined {}: {name}", undef.as_str()))
                })
                .collect();
            Box::<dyn Error>::from(messages.join("; "))
        })?;

    let ctx = Ctx::<data::JustLut<Val>>::new(&filter.lut, Vars::new([]));
    let collection = filter.id.run((ctx, input));

    let mut items: Vec<Node> = vec![];

    for item in collection {
        match unwrap_valr(item) {
            Ok(v) => items.push(to_return_value(v)),
            Err(err) => {
                return Err(Box::<dyn Error>::from(err.to_string()));
            }
        }
    }

    Ok(Node::tuple(items))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::StringVariant;
    const JSON: &str = r#"
        {
            "a": 1,
            "b": 2,
            "c": {
                "d": 3,
                "e": [ 4, 5, 6 ]
            }
        }
    "#;

    #[test]
    fn query_json_works() {
        let result = query_json(JSON, ".a").unwrap();
        assert_eq!(
            result,
            Node::tuple(vec![
                Node::number("1"),
            ]),
        );
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

        let result = query_json(json, ".a").unwrap();
        assert_eq!(
            result,
            Node::tuple(vec![
                Node::number("1")
            ]),
        );
    }

    #[test]
    fn query_json_with_empty_string() {
        let result = query_json("{}", ".[]").unwrap();
        assert_eq!(
            result,
            Node::tuple(vec![])
        );
    }

    #[test]
    fn query_json_empty_query_gives_readable_error() {
        let err = query_json(JSON, "").unwrap_err();
        assert_eq!(err.to_string(), "unexpected end of input, expected term");
    }

    #[test]
    fn query_json_unexpected_token_gives_readable_error() {
        let err = query_json(JSON, ". | ]").unwrap_err();
        assert_eq!(err.to_string(), "unexpected character ']'");
    }

    // --- to_return_value branch coverage ---

    #[test]
    fn query_returns_null_value() {
        let result = query_json(r#"{"a": null}"#, ".a").unwrap();
        assert_eq!(result, Node::tuple(vec![Node::Null]));
    }

    #[test]
    fn query_returns_boolean_true() {
        let result = query_json(r#"{"flag": true}"#, ".flag").unwrap();
        assert_eq!(result, Node::tuple(vec![Node::bool(true)]));
    }

    #[test]
    fn query_returns_boolean_false() {
        let result = query_json(r#"{"flag": false}"#, ".flag").unwrap();
        assert_eq!(result, Node::tuple(vec![Node::bool(false)]));
    }

    #[test]
    fn query_returns_plain_string() {
        let result = query_json(r#"{"name": "alice"}"#, ".name").unwrap();
        assert_eq!(result, Node::tuple(vec![Node::string("alice", None)]));
    }

    #[test]
    fn query_returns_string_with_url_variant() {
        let result = query_json(r#"{"link": "https://example.com"}"#, ".link").unwrap();
        assert_eq!(
            result,
            Node::tuple(vec![Node::string(
                "https://example.com",
                Some(StringVariant::Url),
            )]),
        );
    }

    #[test]
    fn query_returns_string_with_email_variant() {
        let result = query_json(r#"{"email": "user@example.com"}"#, ".email").unwrap();
        assert_eq!(
            result,
            Node::tuple(vec![Node::string(
                "user@example.com",
                Some(StringVariant::Email),
            )]),
        );
    }

    #[test]
    fn query_returns_integer_from_arithmetic() {
        // Val::Int branch: integer arithmetic produces Val::Int
        let result = query_json("{}", "1 + 2").unwrap();
        assert_eq!(result, Node::tuple(vec![Node::number("3")]));
    }

    #[test]
    fn query_returns_float_literal() {
        // Val::Float branch: float literal in filter produces Val::Float
        let result = query_json("{}", "1.5").unwrap();
        assert_eq!(result, Node::tuple(vec![Node::number("1.5")]));
    }

    #[test]
    fn query_returns_array_value() {
        let result = query_json(r#"{"items": [1, 2]}"#, ".items").unwrap();
        assert_eq!(
            result,
            Node::tuple(vec![Node::array(vec![
                Node::number("1"),
                Node::number("2"),
            ])]),
        );
    }

    #[test]
    fn query_returns_object_value() {
        let result = query_json(r#"{"nested": {"x": 1}}"#, ".nested").unwrap();
        assert_eq!(
            result,
            Node::tuple(vec![Node::object(vec![Node::property(
                "x",
                Node::number("1"),
            )])]),
        );
    }

    #[test]
    fn query_returns_multiple_results() {
        let result = query_json(r#"[1, 2, 3]"#, ".[]").unwrap();
        assert_eq!(
            result,
            Node::tuple(vec![
                Node::number("1"),
                Node::number("2"),
                Node::number("3"),
            ]),
        );
    }

    // --- error path coverage ---

    #[test]
    fn query_fails_on_invalid_json_input() {
        assert!(query_json("{invalid}", ".").is_err());
    }

    #[test]
    fn query_runtime_error_propagates() {
        // 'error' built-in raises the input as a runtime error
        let err = query_json("{}", "error").unwrap_err();
        assert!(!err.to_string().is_empty());
    }

    #[test]
    fn query_fails_on_undefined_function() {
        // Calling an undefined 0-arity function triggers a compile error
        let err = query_json("{}", "undefined_custom_func_xyz").unwrap_err();
        assert!(err.to_string().contains("undefined"));
    }
}
