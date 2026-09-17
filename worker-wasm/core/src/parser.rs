use hifijson::escape::Lex as _;
use hifijson::num::{self, LexWrite as _};
use hifijson::str::{LexAlloc as _, LexWrite as _};
use hifijson::token::Lex as _;
use hifijson::{Expect, Read as _, SliceLexer};
use std::borrow::Cow;
use std::error::Error;
use std::fmt::{self, Display, Formatter};

/// Parse error.
#[derive(Debug)]
pub struct ParseError(usize, hifijson::Error);

impl Display for ParseError {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "byte offset {}: {}", self.0, self.1)
    }
}

impl Error for ParseError {}

/// A number literal, kept as the text it was written as so that
/// no precision is lost and nothing has to be formatted back.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Number<'a> {
    /// Digits without a fraction or an exponent, such as `-1`.
    Int(&'a str),
    /// A number with a fraction or an exponent, such as `1.5` or `1e3`.
    Dec(&'a str),
    /// `NaN`, `Infinity` or `-Infinity`.
    NonFinite(f64),
}

impl<'a> Number<'a> {
    /// The number as it is spelled in JSON.
    pub fn text(&self) -> &'a str {
        match *self {
            Self::Int(text) | Self::Dec(text) => text,
            Self::NonFinite(n) if n.is_nan() => "NaN",
            Self::NonFinite(n) if n.is_sign_positive() => "Infinity",
            Self::NonFinite(_) => "-Infinity",
        }
    }
}

pub trait Factory<T> {
    /// Collection that object members are accumulated in.
    ///
    /// The factory owns it so that the parser fills the representation the
    /// factory actually wants, instead of an intermediate list of pairs.
    type Members: Default;

    fn null(&self) -> T;
    fn bool(&self, value: bool) -> T;
    fn number(&self, number: Number<'_>) -> T;
    /// The contents of a string, borrowed from the input unless it had to be
    /// unescaped.
    fn string(&self, value: Cow<'_, str>) -> T;
    fn array(&self, items: Vec<T>) -> T;
    /// Add a member to an object. How duplicate keys are handled is up to the
    /// factory.
    fn insert(&self, members: &mut Self::Members, key: Cow<'_, str>, value: T);
    fn object(&self, members: Self::Members) -> T;
}

/// Parse JSON, accepting the JSON5 extensions that editors and config files use:
/// comments, trailing commas and non-finite numbers.
pub fn parse_json<T, F: Factory<T>>(input: &str, factory: F) -> Result<T, ParseError> {
    let mut lexer = SliceLexer::new(input.as_bytes());
    let offset = |rest: &[u8]| rest.as_ptr() as usize - input.as_ptr() as usize;
    lexer
        .exactly_one(ws_tk, |next, lexer| parse_value(next, lexer, &factory))
        .map_err(|e| ParseError(offset(lexer.as_slice()), e))
}

/// Eat whitespace and comments, then peek at the next character.
fn ws_tk(lexer: &mut SliceLexer) -> Option<u8> {
    loop {
        lexer.eat_whitespace();
        match lexer.peek_next() {
            Some(b'/') if lexer.strip_prefix(b"//") => lexer.skip_until(|c| c == b'\n'),
            Some(b'/') if lexer.strip_prefix(b"/*") => skip_block_comment(lexer),
            Some(b'#') => lexer.skip_until(|c| c == b'\n'),
            next => return next,
        }
    }
}

fn skip_block_comment(lexer: &mut SliceLexer) {
    loop {
        lexer.skip_until(|c| c == b'*');
        if lexer.take_next().is_none() {
            return;
        }
        if lexer.peek_next() == Some(b'/') {
            lexer.take_next();
            return;
        }
    }
}

/// Run `f` for every item of a comma-separated sequence terminated by `end`,
/// accepting a trailing comma.
fn seq<'a>(
    lexer: &mut SliceLexer<'a>,
    end: u8,
    mut f: impl FnMut(u8, &mut SliceLexer<'a>) -> Result<(), hifijson::Error>,
) -> Result<(), hifijson::Error> {
    lexer.take_next(); // consume the opening bracket
    let mut next = ws_tk(lexer).ok_or(Expect::ValueOrEnd)?;
    while next != end {
        f(next, lexer)?;
        next = ws_tk(lexer).ok_or(Expect::CommaOrEnd)?;
        if next != end {
            if next != b',' {
                return Err(Expect::CommaOrEnd.into());
            }
            lexer.take_next(); // consume ','
            next = ws_tk(lexer).ok_or(Expect::ValueOrEnd)?;
        }
    }
    lexer.take_next(); // consume the closing bracket
    Ok(())
}

fn parse_value<'a, T, F: Factory<T>>(
    next: u8,
    lexer: &mut SliceLexer<'a>,
    factory: &F,
) -> Result<T, hifijson::Error> {
    Ok(match next {
        b'n' if lexer.strip_prefix(b"null") => factory.null(),
        b't' if lexer.strip_prefix(b"true") => factory.bool(true),
        b'f' if lexer.strip_prefix(b"false") => factory.bool(false),
        b'b' if lexer.strip_prefix(b"b\"") => factory.string(parse_byte_string(lexer)?),
        b'N' if lexer.strip_prefix(b"NaN") => factory.number(Number::NonFinite(f64::NAN)),
        b'I' if lexer.strip_prefix(b"Infinity") => {
            factory.number(Number::NonFinite(f64::INFINITY))
        }
        b'0'..=b'9' | b'+' | b'-' => factory.number(parse_number(lexer)?),
        b'"' => factory.string(parse_string(lexer)?),
        b'[' => factory.array(parse_array(lexer, factory)?),
        b'{' => parse_object(lexer, factory)?,
        _ => Err(Expect::Value)?,
    })
}

fn parse_array<'a, T, F: Factory<T>>(
    lexer: &mut SliceLexer<'a>,
    factory: &F,
) -> Result<Vec<T>, hifijson::Error> {
    let mut items = Vec::new();
    seq(lexer, b']', |next, lexer| {
        items.push(parse_value(next, lexer, factory)?);
        Ok(())
    })?;
    Ok(items)
}

fn parse_object<'a, T, F: Factory<T>>(
    lexer: &mut SliceLexer<'a>,
    factory: &F,
) -> Result<T, hifijson::Error> {
    let mut members = F::Members::default();
    seq(lexer, b'}', |next, lexer| {
        if next != b'"' {
            return Err(Expect::Value.into());
        }
        let key = parse_string(lexer)?;
        lexer.expect(ws_tk, b':').ok_or(Expect::Colon)?;
        let value = parse_value(ws_tk(lexer).ok_or(Expect::Value)?, lexer, factory)?;
        factory.insert(&mut members, key, value);
        Ok(())
    })?;
    Ok(factory.object(members))
}

/// Read a string, borrowing it from the input when it contains no escapes.
fn parse_string<'a>(lexer: &mut SliceLexer<'a>) -> Result<Cow<'a, str>, hifijson::Error> {
    lexer.discarded().str_string().map_err(hifijson::Error::Str)
}

/// Read a `b"..."` string, which allows `\x` but no `\u` escapes.
///
/// Such a string may hold arbitrary bytes, so invalid UTF-8 is replaced rather
/// than rejected.
fn parse_byte_string<'a>(lexer: &mut SliceLexer<'a>) -> Result<Cow<'a, str>, hifijson::Error> {
    let on_string = |read: &mut &[u8], out: &mut Vec<u8>| {
        out.extend_from_slice(read);
        Ok(())
    };
    let bytes = lexer
        .str_fold(Vec::new(), on_string, |lexer, out| {
            use hifijson::escape::Error;
            match lexer.take_next().ok_or(Error::Eof)? {
                b'u' => Err(Error::InvalidKind(b'u'))?,
                b'x' => out.push(lexer.hex()?),
                c => out.extend(lexer.escape(c)?.encode_utf8(&mut [0; 4]).as_bytes()),
            }
            Ok(())
        })
        .map_err(hifijson::Error::Str)?;
    Ok(Cow::Owned(match String::from_utf8(bytes) {
        Ok(string) => string,
        Err(e) => String::from_utf8_lossy(e.as_bytes()).into_owned(),
    }))
}

fn parse_number<'a>(lexer: &mut SliceLexer<'a>) -> Result<Number<'a>, hifijson::Error> {
    let (text, parts) = lexer.num_string_with(num::Num::signed_digits()).unvalidated();
    Ok(match text {
        "+" if lexer.strip_prefix(b"Infinity") => Number::NonFinite(f64::INFINITY),
        "-" if lexer.strip_prefix(b"Infinity") => Number::NonFinite(f64::NEG_INFINITY),
        _ if text.as_bytes().last().is_some_and(u8::is_ascii_digit) => {
            if parts.is_int() {
                Number::Int(text)
            } else {
                Number::Dec(text)
            }
        }
        _ => Err(num::Error::ExpectedDigit)?,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::jaq_json_factory::JaqJsonFactory;
    use jaq_json::Val;

    // ── helpers ───────────────────────────────────────────────────────────────

    fn parse(input: &str) -> Result<Val, ParseError> {
        parse_json(input, JaqJsonFactory)
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
