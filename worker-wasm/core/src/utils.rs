use email_address::EmailAddress;
use url::Url;
use crate::StringVariant;

pub fn is_url(value: &str) -> bool {
    let url = match Url::parse(value) {
        Ok(url) => url,
        Err(_) => return false,
    };

    matches!(url.scheme(), "http" | "https" | "ftp" | "mailto")
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
