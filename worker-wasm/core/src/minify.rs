use std::error::Error;
use crate::parser::JaqJsonFactory;

pub fn minify_json(input: &str) -> Result<String, Box<dyn Error>> {
    let val = crate::parser::parse_json(input.as_bytes(), JaqJsonFactory)?;
    Ok(val.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn minifies_plain_json() {
        let input = r#"
        {
            "a": 1,
            "b": 2
        }
        "#;

        let result = minify_json(input).unwrap();
        assert_eq!(result, r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn supports_single_line_comments() {
        let input = r#"
        {
            // this is a comment
            "a": 1,
            "b": 2 // trailing comment
        }
        "#;

        let result = minify_json(input).unwrap();
        assert_eq!(result, r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn supports_block_comments() {
        let input = r#"
        {
            /* block
               comment */
            "a": 1,
            /* another */ "b": 2
        }
        "#;

        let result = minify_json(input).unwrap();
        assert_eq!(result, r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn supports_trailing_commas() {
        let input = r#"
        {
            "a": 1,
            "b": 2,
        }
        "#;

        let result = minify_json(input).unwrap();
        assert_eq!(result, r#"{"a":1,"b":2}"#);
    }

    #[test]
    fn fails_on_invalid_json() {
        let input = r#"
        {
            "a": 1,
            "b":
        }
        "#;

        assert!(minify_json(input).is_err());
    }

    #[test]
    fn minifies_empty_json() {
        let input = "{}";

        let actual = minify_json(input).unwrap();

        assert_eq!(actual, "{}");
    }

    #[test]
    fn minifies_array_root() {
        let result = minify_json(r#"[ 1, 2, 3 ]"#).unwrap();
        assert_eq!(result, "[1,2,3]");
    }

    #[test]
    fn minifies_boolean_true() {
        assert_eq!(minify_json("true").unwrap(), "true");
    }

    #[test]
    fn minifies_boolean_false() {
        assert_eq!(minify_json("false").unwrap(), "false");
    }

    #[test]
    fn minifies_null_value() {
        assert_eq!(minify_json("null").unwrap(), "null");
    }

    #[test]
    fn minifies_string_value() {
        assert_eq!(minify_json(r#""hello world""#).unwrap(), r#""hello world""#);
    }

    #[test]
    fn minifies_integer_number() {
        assert_eq!(minify_json("42").unwrap(), "42");
    }

    #[test]
    fn minifies_float_number() {
        assert_eq!(minify_json("3.14").unwrap(), "3.14");
    }

    #[test]
    fn minifies_string_escapes_special_chars() {
        assert_eq!(minify_json(r#""a\nb\tc""#).unwrap(), r#""a\nb\tc""#);
    }

    #[test]
    fn minifies_nested() {
        assert_eq!(
            minify_json(r#"{"x": [1, {"y": true}]}"#).unwrap(),
            r#"{"x":[1,{"y":true}]}"#,
        );
    }
}
