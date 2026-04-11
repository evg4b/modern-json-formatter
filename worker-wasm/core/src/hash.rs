use jaq_core::native::{bome, run, Filter, Fun, v};
use jaq_core::{Cv, DataT, RunPtr};
use jaq_std::ValT;
use sha2::Digest;
use std::fmt::Write;

pub fn hash_funs<D: DataT>() -> impl Iterator<Item = Fun<D>>
where
    for<'a> D::V<'a>: ValT,
{
    hash_run::<D>().into_vec().into_iter().map(run)
}

fn hash_run<D: DataT>() -> Box<[Filter<RunPtr<D>>]>
where
    for<'a> D::V<'a>: ValT,
{
    Box::new([
        ("md5", v(0), |cv: Cv<'_, D>| {
            bome(cv.1.try_as_utf8_bytes().map(|bytes| {
                format!("{:x}", md5::compute(bytes)).into()
            }))
        }),
        ("sha256", v(0), |cv: Cv<'_, D>| {
            bome(cv.1.try_as_utf8_bytes().map(|bytes| {
                encode_hex(&sha2::Sha256::digest(bytes)).into()
            }))
        }),
        ("sha512", v(0), |cv: Cv<'_, D>| {
            bome(cv.1.try_as_utf8_bytes().map(|bytes| {
                encode_hex(&sha2::Sha512::digest(bytes)).into()
            }))
        }),
    ])
}

fn encode_hex(bytes: &[u8]) -> String {
    bytes.iter().fold(String::with_capacity(bytes.len() * 2), |mut string, b| {
        write!(string, "{b:02x}").unwrap();
        string
    })
}

#[cfg(test)]
mod tests {
    use crate::node::Node;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};
    use crate::query::query_json;

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    fn expect(output: &str) -> Node {
        NodeJsonFactory.tuple(vec![node(output)])
    }

    #[test]
    fn md5_of_string() {
        let result = query_json("\"hello\"", "md5").unwrap();
        assert_eq!(result, expect("\"5d41402abc4b2a76b9719d911017c592\""));
    }

    #[test]
    fn sha256_of_string() {
        let result = query_json("\"hello\"", "sha256").unwrap();
        assert_eq!(
            result,
            expect("\"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\"")
        );
    }

    #[test]
    fn sha512_of_string() {
        let result = query_json("\"hello\"", "sha512").unwrap();
        assert_eq!(
            result,
            expect("\"9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043\"")
        );
    }

    #[test]
    fn md5_on_non_string_returns_error() {
        let result = query_json("42", "md5");
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err().to_string(),
            "cannot use 42 as string"
        );
    }
}
