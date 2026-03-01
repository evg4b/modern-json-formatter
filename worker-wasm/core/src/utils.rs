use email_address::EmailAddress;
use url::Url;
use crate::StringVariant;

pub fn is_url(value: &str) -> bool {
    let url = match Url::parse(value.trim()) {
        Ok(url) => url,
        Err(_) => return false,
    };

    matches!(url.scheme(), "http" | "https" | "ftp" | "mailto")
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
}


pub fn determinate_variant(string: &str) -> Option<StringVariant> {
    if is_url(string) {
        return Some(StringVariant::Url);
    }

    if EmailAddress::is_valid(string) {
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
}
