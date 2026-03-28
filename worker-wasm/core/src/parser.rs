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
            lexer.take_next(); // consume '['
            let mut next = ws_tk(lexer).ok_or(Expect::ValueOrEnd)?;
            if next != b']' {
                loop {
                    arr.push(parse(next, lexer)?);
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
        b'{' => Val::obj({
            let mut obj = Map::default();
            lexer.take_next(); // consume '{'
            let mut next = ws_tk(lexer).ok_or(Expect::ValueOrEnd)?;
            if next != b'}' {
                loop {
                    let key = parse(next, lexer)?;
                    lexer.expect(ws_tk, b':').ok_or(Expect::Colon)?;
                    let value = parse(ws_tk(lexer).ok_or(Expect::Value)?, lexer)?;
                    obj.insert(key, value);
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

