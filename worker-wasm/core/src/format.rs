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
    fn fails_on_invalid_json5() {
        let input = r#"
        {
            "a": 1,
            "b":
        }
        "#;

        let err = format_json(input).unwrap_err();
        assert!(!err.to_string().is_empty());
    }
}
