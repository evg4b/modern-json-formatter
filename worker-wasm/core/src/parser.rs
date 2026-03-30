use hifijson::token::Lex;
use hifijson::{Expect, LexAlloc, SliceLexer};
use jaq_json::{Map, Num, Val};
use std::fmt;
use std::fmt::{Display, Formatter};
use std::rc::Rc;
use num_bigint::{BigInt, BigUint, Sign};

/// Parse error.
#[derive(Debug)]
pub struct ParseError(usize, hifijson::Error);

impl Display for ParseError {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "byte offset {}: {}", self.0, self.1)
    }
}

impl std::error::Error for ParseError {}

pub trait Factory<T> {
    fn null(&self) -> T;
    fn bool(&self, val: bool) -> T;
    fn number(&self, n: Num) -> T;
    fn string(&self, s: Vec<u8>) -> T;
    fn array(&self, arr: Vec<T>) -> T;
    fn object(&self, obj: Vec<(String, T)>) -> T;
}

pub fn parse_json<T, U: Factory<T>>(
    slice: &[u8],
    factory: U,
) -> Result<T, Box<dyn std::error::Error>> {
    let offset = |rest: &[u8]| rest.as_ptr() as usize - slice.as_ptr() as usize;
    let mut lexer = SliceLexer::new(slice);
    lexer
        .exactly_one(ws_tk, move |next, lexer| parse_inner(next, lexer, &factory))
        .map_err(|e| {
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
                Num::from_str_radix(num, 10).ok_or(hifijson::num::Error::ExpectedDigit)?
            } else {
                Num::Dec(num.to_string().into())
            }
        }
        _ => Err(hifijson::num::Error::ExpectedDigit)?,
    })
}

// ── Parsing ───────────────────────────────────────────────────────────────────

fn ws_tk<L: LexAlloc>(lexer: &mut L) -> Option<u8> {
    loop {
        lexer.eat_whitespace();
        match lexer.peek_next() {
            Some(b'/') if lexer.strip_prefix(b"//") => lexer.skip_until(|c| c == b'\n'),
            Some(b'/') if lexer.strip_prefix(b"/*") => {
                loop {
                    lexer.skip_until(|c| c == b'*');
                    if lexer.peek_next().is_none() {
                        break;
                    }
                    lexer.take_next(); // consume '*'
                    if lexer.peek_next() == Some(b'/') {
                        lexer.take_next(); // consume '/'
                        break;
                    }
                }
            }
            Some(b'#') => lexer.skip_until(|c| c == b'\n'),
            next => return next,
        }
    }
}

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

fn parse_inner<L: LexAlloc, T, U: Factory<T>>(
    next: u8,
    lexer: &mut L,
    factory: &U,
) -> Result<T, hifijson::Error> {
    Ok(match next {
        b'n' if lexer.strip_prefix(b"null") => factory.null(),
        b't' if lexer.strip_prefix(b"true") => factory.bool(true),
        b'f' if lexer.strip_prefix(b"false") => factory.bool(false),
        b'b' if lexer.strip_prefix(b"b\"") => factory.string(parse_string(lexer, true)?),
        b'N' if lexer.strip_prefix(b"NaN") => factory.number(Num::Float(f64::NAN)),
        b'I' if lexer.strip_prefix(b"Infinity") => factory.number(Num::Float(f64::INFINITY)),
        b'0'..=b'9' | b'+' | b'-' => factory.number(parse_num(lexer)?),
        b'"' => factory.string(parse_string(lexer.discarded(), false)?),
        b'[' => factory.array({
            let mut arr = Vec::new();
            lexer.take_next(); // consume '['
            let mut next = ws_tk(lexer).ok_or(Expect::ValueOrEnd)?;
            if next != b']' {
                loop {
                    arr.push(parse_inner(next, lexer, factory)?);
                    next = ws_tk(lexer).ok_or(Expect::CommaOrEnd)?;
                    if next == b']' {
                        lexer.take_next();
                        break;
                    }
                    if next != b',' {
                        return Err(Expect::CommaOrEnd.into());
                    }
                    lexer.take_next(); // consume ','
                    next = ws_tk(lexer).ok_or(Expect::ValueOrEnd)?;
                    if next == b']' {
                        lexer.take_next(); // trailing comma — accept
                        break;
                    }
                }
            } else {
                lexer.take_next(); // consume ']'
            }
            arr.into()
        }),
        b'{' => factory.object({
            let mut obj:Vec<(String, T)> = Vec::new();
            lexer.take_next(); // consume '{'
            let mut next = ws_tk(lexer).ok_or(Expect::ValueOrEnd)?;
            if next != b'}' {
                loop {
                    if next != b'"' {
                        return Err(Expect::Value.into());
                    }
                    let key_bytes = parse_string(lexer.discarded(), false)?;
                    let key = String::from_utf8(key_bytes).map_err(|_| Expect::Value)?;
                    lexer.expect(ws_tk, b':').ok_or(Expect::Colon)?;
                    let value = parse_inner(ws_tk(lexer).ok_or(Expect::Value)?, lexer, factory)?;
                    obj.push((key, value));
                    next = ws_tk(lexer).ok_or(Expect::CommaOrEnd)?;
                    if next == b'}' {
                        lexer.take_next();
                        break;
                    }
                    if next != b',' {
                        return Err(Expect::CommaOrEnd.into());
                    }
                    lexer.take_next(); // consume ','
                    next = ws_tk(lexer).ok_or(Expect::ValueOrEnd)?;
                    if next == b'}' {
                        lexer.take_next(); // trailing comma — accept
                        break;
                    }
                }
            } else {
                lexer.take_next(); // consume '}'
            }
            obj
        }),
        _ => Err(Expect::Value)?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── helpers ───────────────────────────────────────────────────────────────

    fn parse(input: &str) -> Result<Val, Box<dyn std::error::Error>> {
        parse_json(input.as_bytes(), JaqJsonFactory)
    }

    fn ok(input: &str) -> Val {
        parse(input).expect("expected valid JSON")
    }

    // ── classic JSON primitives ───────────────────────────────────────────────

    #[test]
    fn parses_null() {
        assert_eq!(ok("null"), Val::Null);
    }

    #[test]
    fn parses_true() {
        assert_eq!(ok("true"), Val::Bool(true));
    }

    #[test]
    fn parses_false() {
        assert_eq!(ok("false"), Val::Bool(false));
    }

    #[test]
    fn parses_integer() {
        assert_eq!(ok("42").to_string(), "42");
    }

    #[test]
    fn parses_negative_integer() {
        assert_eq!(ok("-7").to_string(), "-7");
    }

    #[test]
    fn parses_float() {
        assert_eq!(ok("3.14").to_string(), "3.14");
    }

    #[test]
    fn parses_string() {
        assert_eq!(ok(r#""hello""#).to_string(), r#""hello""#);
    }

    #[test]
    fn parses_string_with_escape_sequences() {
        assert_eq!(ok(r#""a\nb\tc""#).to_string(), r#""a\nb\tc""#);
    }

    #[test]
    fn parses_string_with_unicode_escape() {
        assert_eq!(ok(r#""\u0041""#).to_string(), r#""A""#);
    }

    #[test]
    fn parses_empty_object() {
        assert_eq!(ok("{}").to_string(), "{}");
    }

    #[test]
    fn parses_object_with_single_field() {
        assert_eq!(ok(r#"{"a":1}"#).to_string(), r#"{"a":1}"#);
    }

    #[test]
    fn parses_object_with_multiple_fields() {
        assert_eq!(ok(r#"{"a":1,"b":2}"#).to_string(), r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn parses_empty_array() {
        assert_eq!(ok("[]").to_string(), "[]");
    }

    #[test]
    fn parses_array_with_values() {
        assert_eq!(ok("[1,2,3]").to_string(), "[1,2,3]");
    }

    #[test]
    fn parses_nested_structure() {
        assert_eq!(
            ok(r#"{"x":[1,{"y":true}]}"#).to_string(),
            r#"{"x":[1,{"y":true}]}"#,
        );
    }

    #[test]
    fn parses_whitespace_around_values() {
        assert_eq!(ok("  42  ").to_string(), "42");
    }

    // ── error cases ───────────────────────────────────────────────────────────

    #[test]
    fn fails_on_empty_input() {
        assert!(parse("").is_err());
    }

    #[test]
    fn fails_on_whitespace_only() {
        assert!(parse("   ").is_err());
    }

    #[test]
    fn fails_on_missing_value_in_object() {
        assert!(parse(r#"{"a":}"#).is_err());
    }

    #[test]
    fn fails_on_missing_colon_in_object() {
        assert!(parse(r#"{"a" 1}"#).is_err());
    }

    #[test]
    fn fails_on_unclosed_object() {
        assert!(parse(r#"{"a":1"#).is_err());
    }

    #[test]
    fn fails_on_unclosed_array() {
        assert!(parse("[1,2").is_err());
    }

    #[test]
    fn fails_on_double_comma_in_array() {
        assert!(parse("[1,,2]").is_err());
    }

    #[test]
    fn fails_on_double_comma_in_object() {
        assert!(parse(r#"{"a":1,,"b":2}"#).is_err());
    }

    #[test]
    fn fails_on_multiple_root_values() {
        assert!(parse("1 2").is_err());
    }

    #[test]
    fn fails_on_bare_identifier() {
        assert!(parse("foo").is_err());
    }

    // ── JSON5: line comments (//) ─────────────────────────────────────────────

    #[test]
    fn single_line_comment_before_value() {
        assert_eq!(ok("// comment\n42").to_string(), "42");
    }

    #[test]
    fn single_line_comment_inside_object() {
        let input = r#"{"a": 1, // comment
"b": 2}"#;
        assert_eq!(ok(input).to_string(), r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn single_line_comment_at_end_of_input() {
        assert_eq!(ok("42 // comment").to_string(), "42");
    }

    #[test]
    fn hash_comment_before_value() {
        assert_eq!(ok("# comment\n42").to_string(), "42");
    }

    #[test]
    fn single_slash_is_not_a_comment() {
        assert!(parse(r#"{ / "a": 1 }"#).is_err());
    }

    // ── JSON5: block comments (/* */) ─────────────────────────────────────────

    #[test]
    fn block_comment_before_value() {
        assert_eq!(ok("/* comment */ 42").to_string(), "42");
    }

    #[test]
    fn block_comment_inside_object() {
        assert_eq!(ok(r#"{"a": /* comment */ 1}"#).to_string(), r#"{"a":1}"#,);
    }

    #[test]
    fn block_comment_multiline() {
        let input = "/* line1\n   line2\n*/42";
        assert_eq!(ok(input).to_string(), "42");
    }

    #[test]
    fn block_comment_with_star_inside() {
        assert_eq!(ok("/* a * b */ 42").to_string(), "42");
    }

    #[test]
    fn block_comment_back_to_back() {
        assert_eq!(ok("/* a *//* b */ 42").to_string(), "42");
    }

    #[test]
    fn unterminated_block_comment_fails() {
        assert!(parse("/* oops 42").is_err());
    }

    // ── JSON5: trailing commas ────────────────────────────────────────────────

    #[test]
    fn trailing_comma_in_object() {
        assert_eq!(ok(r#"{"a":1,"b":2,}"#).to_string(), r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn trailing_comma_in_array() {
        assert_eq!(ok("[1,2,3,]").to_string(), "[1,2,3]");
    }

    #[test]
    fn trailing_comma_in_empty_array_fails() {
        assert!(parse("[,]").is_err());
    }

    #[test]
    fn trailing_comma_in_empty_object_fails() {
        assert!(parse("{,}").is_err());
    }

    #[test]
    fn trailing_comma_nested_object() {
        assert_eq!(
            ok(r#"{"a":{"b":1,},"c":[2,3,],}"#).to_string(),
            r#"{"a":{"b":1},"c":[2,3]}"#,
        );
    }

    // ── error message format ──────────────────────────────────────────────────

    #[test]
    fn error_message_contains_byte_offset() {
        let err = parse("   ???").unwrap_err();
        assert!(err.to_string().contains("byte offset"));
    }
}
