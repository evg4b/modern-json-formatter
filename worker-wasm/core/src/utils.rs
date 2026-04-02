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
    let Some((local, domain)) = value.split_once('@') else {
        return false;
    };
    if local.is_empty() || domain.is_empty() || domain.contains('@') {
        return false;
    }
    domain
        .rfind('.')
        .is_some_and(|dot| dot > 0 && dot < domain.len() - 1)
}

pub fn determine_variant(string: &str) -> Option<StringVariant> {
    if is_url(string) {
        return Some(StringVariant::Url);
    }
    if is_email(string) {
        return Some(StringVariant::Email);
    }
    None
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

#[cfg(test)]
mod tests_determine_variant {
    use super::*;

    #[test]
    fn returns_url_variant_for_url() {
        assert_eq!(determine_variant("https://example.com"), Some(StringVariant::Url));
    }

    #[test]
    fn returns_email_variant_for_valid_email() {
        assert_eq!(determine_variant("user@example.com"), Some(StringVariant::Email));
    }

    #[test]
    fn returns_none_for_invalid_string() {
        assert!(determine_variant("not_a_url_or_email").is_none());
    }

    #[test]
    fn returns_url_for_mailto_link() {
        assert_eq!(determine_variant("mailto:user@example.com"), Some(StringVariant::Url));
    }

    #[test]
    fn returns_none_for_empty_string() {
        assert!(determine_variant("").is_none());
    }
}
