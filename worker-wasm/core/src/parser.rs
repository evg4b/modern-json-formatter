use hifijson::token::Lex;
use hifijson::{Expect, LexAlloc, SliceLexer};
use jaq_json::{Map, Num, Val};
use std::fmt;
use std::fmt::{Display, Formatter};

/// Parse error.
#[derive(Debug)]
pub struct ParseError(usize, hifijson::Error);

impl Display for ParseError {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "byte offset {}: {}", self.0, self.1)
    }
}

impl std::error::Error for ParseError {}

pub fn parse_json(slice: &[u8]) -> Result<Val, Box<dyn std::error::Error>> {
    let offset = |rest: &[u8]| rest.as_ptr() as usize - slice.as_ptr() as usize;
    let mut lexer = SliceLexer::new(slice);
    lexer.exactly_one(ws_tk, parse).map_err(|e| {
        Box::new(ParseError(offset(lexer.as_slice()), e)) as Box<dyn std::error::Error>
    })
}

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

// ── Serialisation ────────────────────────────────────────────────────────────

pub fn val_to_minified(val: &Val) -> String {
    val.to_string()
}

pub fn val_to_formatted(val: &Val) -> String {
    let pp = jaq_json::write::Pp {
        indent: Some("  ".to_string()),
        sep_space: true,
        ..jaq_json::write::Pp::default()
    };
    let mut buf = Vec::<u8>::new();
    jaq_json::write::write(&mut buf, &pp, 0, val).unwrap();
    String::from_utf8_lossy(&buf).into_owned()
}

// ── Parsing ───────────────────────────────────────────────────────────────────

fn ws_tk<L: LexAlloc>(lexer: &mut L) -> Option<u8> {
    loop {
        lexer.eat_whitespace();
        match lexer.peek_next() {
            Some(b'/') if lexer.strip_prefix(b"//") => lexer.skip_until(|c| c == b'\n'),
            Some(b'#') => lexer.skip_until(|c| c == b'\n'),
            next => return next,
        }
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    // helpers: parse then re-serialise
    fn minified(json: &str) -> String {
        val_to_minified(&parse_json(json.as_bytes()).unwrap())
    }
    fn formatted(json: &str) -> String {
        val_to_formatted(&parse_json(json.as_bytes()).unwrap())
    }

    // ── val_to_minified ───────────────────────────────────────────────────────

    #[test]
    fn minified_null() {
        assert_eq!(minified("null"), "null");
    }

    #[test]
    fn minified_bool_true() {
        assert_eq!(minified("true"), "true");
    }

    #[test]
    fn minified_bool_false() {
        assert_eq!(minified("false"), "false");
    }

    #[test]
    fn minified_integer() {
        assert_eq!(minified("42"), "42");
    }

    #[test]
    fn minified_float() {
        assert_eq!(minified("3.14"), "3.14");
    }

    #[test]
    fn minified_string() {
        assert_eq!(minified(r#""hello""#), r#""hello""#);
    }

    #[test]
    fn minified_string_escapes_special_chars() {
        assert_eq!(minified(r#""a\nb\tc""#), r#""a\nb\tc""#);
    }

    #[test]
    fn minified_empty_array() {
        assert_eq!(minified("[]"), "[]");
    }

    #[test]
    fn minified_array() {
        assert_eq!(minified("[1, 2, 3]"), "[1,2,3]");
    }

    #[test]
    fn minified_empty_object() {
        assert_eq!(minified("{}"), "{}");
    }

    #[test]
    fn minified_object() {
        assert_eq!(minified(r#"{ "a": 1, "b": 2 }"#), r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn minified_nested() {
        assert_eq!(
            minified(r#"{"x": [1, {"y": true}]}"#),
            r#"{"x":[1,{"y":true}]}"#,
        );
    }

    // ── val_to_formatted ──────────────────────────────────────────────────────

    #[test]
    fn formatted_null() {
        assert_eq!(formatted("null"), "null");
    }

    #[test]
    fn formatted_bool_true() {
        assert_eq!(formatted("true"), "true");
    }

    #[test]
    fn formatted_bool_false() {
        assert_eq!(formatted("false"), "false");
    }

    #[test]
    fn formatted_integer() {
        assert_eq!(formatted("42"), "42");
    }

    #[test]
    fn formatted_float() {
        assert_eq!(formatted("3.14"), "3.14");
    }

    #[test]
    fn formatted_string() {
        assert_eq!(formatted(r#""hello""#), r#""hello""#);
    }

    #[test]
    fn formatted_empty_array() {
        assert_eq!(formatted("[]"), "[]");
    }

    #[test]
    fn formatted_array() {
        assert_eq!(formatted("[1,2,3]"), "[\n  1,\n  2,\n  3\n]");
    }

    #[test]
    fn formatted_empty_object() {
        assert_eq!(formatted("{}"), "{}");
    }

    #[test]
    fn formatted_object() {
        assert_eq!(
            formatted(r#"{"a":1,"b":2}"#),
            "{\n  \"a\": 1,\n  \"b\": 2\n}",
        );
    }

    #[test]
    fn formatted_nested() {
        assert_eq!(
            formatted(r#"{"x":[1,2]}"#),
            "{\n  \"x\": [\n    1,\n    2\n  ]\n}",
        );
    }
}
