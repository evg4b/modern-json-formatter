use jaq_json::write::{write as jaq_write, Pp};
use std::error::Error;
use crate::jaq_json_factory::JaqJsonFactory;

pub fn format_json(input: &str) -> Result<String, Box<dyn Error>> {
    let val = crate::parser::parse_json(input.as_bytes(), JaqJsonFactory)?;
    let pp = Pp {
        indent: Some("  ".to_string()),
        sep_space: true,
        ..Pp::default()
    };
    let mut buf = Vec::<u8>::new();
    jaq_write(&mut buf, &pp, 0, &val)?;
    Ok(String::from_utf8_lossy(&buf).into_owned())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn formats_plain_json() {
        let input = r#"{"a":1,"b":2}"#;

        let result = format_json(input).unwrap();
        let expected = r#"{
  "a": 1,
  "b": 2
}"#;

        assert_eq!(result, expected);
    }

    #[test]
    fn supports_single_line_comments() {
        let input = r#"
        {
            // comment before
            "a": 1,
            "b": 2 // comment after
        }
        "#;

        let result = format_json(input).unwrap();

        assert_eq!(
            result,
            r#"{
  "a": 1,
  "b": 2
}"#
        );
    }

    #[test]
    fn supports_block_comments() {
        let input = r#"
        {
            /* multi
               line
               comment */
            "a": 1,
            /* inline */ "b": 2
        }
        "#;

        let result = format_json(input).unwrap();

        assert_eq!(
            result,
            r#"{
  "a": 1,
  "b": 2
}"#
        );
    }

    #[test]
    fn supports_trailing_commas() {
        let input = r#"
        {
            "a": 1,
            "b": 2,
        }
        "#;

        let result = format_json(input).unwrap();

        assert_eq!(
            result,
            r#"{
  "a": 1,
  "b": 2
}"#
        );
    }

    #[test]
    fn fails_on_invalid_json() {
        let input = r#"
        {
            "a": 1,
            "b":
        }
        "#;

        assert!(format_json(input).is_err());
    }

    #[test]
    fn formats_empty_json() {
        assert_eq!(format_json("{}").unwrap(), "{}");
    }

    #[test]
    fn formats_array_root() {
        assert_eq!(format_json("[1,2,3]").unwrap(), "[\n  1,\n  2,\n  3\n]");
    }

    #[test]
    fn formats_boolean_true() {
        assert_eq!(format_json("true").unwrap(), "true");
    }

    #[test]
    fn formats_boolean_false() {
        assert_eq!(format_json("false").unwrap(), "false");
    }

    #[test]
    fn formats_null_value() {
        assert_eq!(format_json("null").unwrap(), "null");
    }

    #[test]
    fn formats_string_value() {
        assert_eq!(format_json(r#""hello world""#).unwrap(), r#""hello world""#);
    }

    #[test]
    fn formats_integer_number() {
        assert_eq!(format_json("42").unwrap(), "42");
    }

    #[test]
    fn formats_float_number() {
        assert_eq!(format_json("3.14").unwrap(), "3.14");
    }
}
