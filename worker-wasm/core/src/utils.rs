use crate::StringVariant;

pub fn is_url(value: &str) -> bool {
    let s = value.trim();
    for scheme in ["https://", "http://", "ftp://"] {
        if let Some(rest) = s.strip_prefix(scheme) {
            return !rest.is_empty() && !rest.starts_with('/');
        }
    }
    if let Some(rest) = s.strip_prefix("mailto:") {
        return !rest.is_empty();
    }
    false
}

fn is_email(value: &str) -> bool {
    let at_pos = match value.find('@') {
        Some(pos) => pos,
        None => return false,
    };
    if value[at_pos + 1..].contains('@') {
        return false;
    }
    let local = &value[..at_pos];
    let domain = &value[at_pos + 1..];
    if local.is_empty() || domain.is_empty() {
        return false;
    }
    if let Some(dot_pos) = domain.rfind('.') {
        dot_pos > 0 && dot_pos < domain.len() - 1
    } else {
        false
    }
}

#[cfg(test)]
mod tests_is_url {
    use super::*;

    #[test]
    fn return_true_for_https_link() {
        assert!(is_url("https://example.com"));
    }

    #[test]
    fn return_true_for_http_link() {
        assert!(is_url("http://example.com"));
    }

    #[test]
    fn return_true_for_ftp_link() {
        assert!(is_url("ftp://example.com"));
    }

    #[test]
    fn return_true_for_mailto_link() {
        assert!(is_url("mailto:example@mail.com"));
    }

    #[test]
    fn return_false_for_invalid_link() {
        assert!(!is_url("invalid-link"));
    }

    #[test]
    fn return_false_for_empty_string() {
        assert!(!is_url(""));
    }

    #[test]
    fn unsupported_scheme_returns_false() {
        assert!(!is_url("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D"));
    }

    #[test]
    fn return_true_for_url_with_leading_and_trailing_whitespace() {
        assert!(is_url("  https://example.com  "));
    }

    #[test]
    fn return_true_for_url_with_path_query_and_fragment() {
        assert!(is_url("https://example.com/path?query=value&other=2#section"));
    }
}


pub fn determinate_variant(string: &str) -> Option<StringVariant> {
    if is_url(string) {
        return Some(StringVariant::Url);
    }

    if is_email(string) {
        return Some(StringVariant::Email);
    }

    None
}

#[cfg(test)]
mod tests_determinate_variant {
    use super::*;

    #[test]
    fn returns_url_variant_for_url() {
        let actual = determinate_variant("https://example.com").unwrap();
        assert_eq!(actual, StringVariant::Url);
    }

    #[test]
    fn returns_email_variant_for_valid_email() {
        let actual = determinate_variant("user@example.com").unwrap();
        assert_eq!(actual, StringVariant::Email);
    }

    #[test]
    fn returns_none_for_invalid_string() {
        let actual = determinate_variant("not_a_url_or_email");
        assert!(actual.is_none());
    }

    #[test]
    fn returns_url_for_mailto_link() {
        let actual = determinate_variant("mailto:user@example.com").unwrap();
        assert_eq!(actual, StringVariant::Url);
    }

    #[test]
    fn returns_none_for_empty_string() {
        assert!(determinate_variant("").is_none());
    }
}
