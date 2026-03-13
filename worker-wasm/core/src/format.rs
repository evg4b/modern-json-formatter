use json5::from_str;
use serde_json::Value;
use serde_json::to_string_pretty;
use std::error::Error;

pub fn format_json(input: &str) -> Result<String, Box<dyn Error>> {
    let value = from_str::<Value>(input)?;
    Ok(to_string_pretty(&value)?)
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
    fn formats_empty_json() {
        let input = "{}";
        let result = format_json(input).unwrap();
        assert_eq!(result, "{}");
    }

    #[test]
    fn fails_on_invalid_json() {
        let input = r#"
        {
            "a": 1,
            "b":
        }
        "#;

        let err = format_json(input).unwrap_err();
        assert_eq!(err.to_string(), "expected value at line 5 column 9");
    }

    #[test]
    fn formats_array_root() {
        let result = format_json(r#"[1,2,3]"#).unwrap();
        assert_eq!(result, "[\n  1,\n  2,\n  3\n]");
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
