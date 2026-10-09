use divan::{black_box, AllocProfiler, Bencher};
use std::fmt::Write as _;
use std::sync::LazyLock;

#[global_allocator]
static ALLOC: AllocProfiler = AllocProfiler::system();

static DOCUMENT: LazyLock<String> = LazyLock::new(|| records(2_000));

fn records(count: usize) -> String {
    let mut json = String::from("[");
    for i in 0..count {
        if i > 0 {
            json.push(',');
        }
        write!(
            json,
            r#"
  {{
    "id": {i},
    "guid": "{i:08}-e5f6-7890-abcd-ef1234567890",
    "active": {active},
    "balance": {balance}.{cents:02},
    "score": {score}e-3,
    "big": 1234567890123456789012{i},
    "name": "User Number {i}",
    "email": "user{i}@example.com",
    "site": "https://example.com/u/{i}",
    "address": {{ "street": "{i} Main St", "city": "Springfield", "zip": "{zip}" }},
    "tags": ["alpha", "beta", "gamma"],
    "friends": [{{ "id": {next}, "name": "Friend A" }}, {{ "id": {next}, "name": "Friend \"B\"\n" }}],
    "note": null
  }}"#,
            active = i % 2 == 0,
            balance = i * 37,
            cents = i % 100,
            score = i * 15,
            zip = 10_000 + i,
            next = i + 1,
        )
        .unwrap();
    }
    json.push_str("\n]");
    json
}

fn main() {
    divan::main();
}

#[divan::bench]
fn tokenize(bencher: Bencher) {
    bencher.bench(|| core::tokenize_json(black_box(&DOCUMENT)).unwrap());
}

#[divan::bench(args = [".", ".[] | select(.active) | .address.city"])]
fn query(bencher: Bencher, query: &str) {
    bencher.bench(|| core::query_json(black_box(&DOCUMENT), query).unwrap());
}

#[divan::bench]
fn format(bencher: Bencher) {
    bencher.bench(|| core::format_json(black_box(&DOCUMENT)).unwrap());
}

#[divan::bench]
fn minify(bencher: Bencher) {
    bencher.bench(|| core::minify_json(black_box(&DOCUMENT)).unwrap());
}
