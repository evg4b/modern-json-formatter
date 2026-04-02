use crate::convert::val_to_node;
use crate::node::Node;
use crate::node_json_factory::NodeJsonFactory;
use jaq_core::{data, load, unwrap_valr, Compiler, Ctx, Vars};
use jaq_json::Val;
use load::{Arena, File, Loader};
use crate::parser::{parse_json, Factory};
use std::error::Error;
use crate::jaq_json_factory::JaqJsonFactory;

fn format_load_error(e: &load::Error<&str>) -> String {
    match e {
        load::Error::Lex(errs) => errs
            .iter()
            .map(|(expected, found)| {
                let ch = found.chars().next().map(|c| format!("'{c}'")).unwrap_or_else(|| "end of input".to_string());
                match expected {
                    load::lex::Expect::Token => format!("unexpected character {ch}"),
                    _ => format!("unexpected {ch}, expected {}", expected.as_str()),
                }
            })
            .collect::<Vec<_>>()
            .join("; "),
        load::Error::Parse(errs) => errs
            .iter()
            .map(|(expected, found)| {
                let found_desc = if found.is_empty() {
                    "end of input".to_string()
                } else {
                    format!("'{found}'")
                };
                format!("unexpected {found_desc}, expected {}", expected.as_str())
            })
            .collect::<Vec<_>>()
            .join("; "),
        load::Error::Io(errs) => errs
            .iter()
            .map(|(path, err)| format!("cannot load '{path}': {err}"))
            .collect::<Vec<_>>()
            .join("; "),
    }
}

pub fn query_json(json: &str, query: &str) -> Result<Node, Box<dyn Error>> {
    let input = parse_json(json.as_bytes(), JaqJsonFactory)?;
    let program = File {
        code: query,
        path: (),
    };

    let loader = Loader::new(jaq_core::defs().chain(jaq_std::defs()).chain(jaq_json::defs()));
    let arena = Arena::default();

    let modules = loader
        .load(&arena, program)
        .map_err(|errors| {
            let messages: Vec<String> = errors.iter().map(|(_, e)| format_load_error(e)).collect();
            Box::<dyn Error>::from(messages.join("; "))
        })?;

    let filter: jaq_core::Filter<data::JustLut<Val>> = Compiler::default()
        .with_funs(jaq_core::funs::<data::JustLut<Val>>().chain(jaq_std::funs::<data::JustLut<Val>>()).chain(jaq_json::funs::<data::JustLut<Val>>()))
        .compile(modules)
        .map_err(|errors| {
            let messages: Vec<String> = errors
                .iter()
                .flat_map(|(_, errs)| {
                    errs.iter().map(|(name, undef)| format!("undefined {}: {name}", undef.as_str()))
                })
                .collect();
            Box::<dyn Error>::from(messages.join("; "))
        })?;

    let ctx = Ctx::<data::JustLut<Val>>::new(&filter.lut, Vars::new([]));
    let collection = filter.id.run((ctx, input));

    let mut items: Vec<Node> = Vec::new();

    for item in collection {
        match unwrap_valr(item) {
            Ok(v) => items.push(val_to_node(v, &NodeJsonFactory)),
            Err(err) => {
                return Err(Box::<dyn Error>::from(err.to_string()));
            }
        }
    }

    Ok(NodeJsonFactory.tuple(items))
}

#[cfg(test)]
mod faq_basic_filters {
    use super::*;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    fn expect(input: &str, query: &str, outputs: &[&str]) -> Node {
        let _ = (input, query, outputs); // suppress unused warnings if test structure differs
        NodeJsonFactory.tuple(outputs.iter().map(|o| node(o)).collect())
    }

    #[test]
    fn identity_string() {
        let result = query_json("\"Hello, world!\"", ".").unwrap();
        assert_eq!(result, expect("\"Hello, world!\"", ".", &["\"Hello, world!\""]));
    }

    #[test]
    fn identity_big_decimal() {
        let result = query_json("0.12345678901234567890123456789", ".").unwrap();
        assert_eq!(result, expect("0.12345678901234567890123456789", ".", &["0.12345678901234567890123456789"]));
    }

    #[test]
    fn identity_big_integer_with_tojson() {
        let result = query_json("12345678909876543212345", "[., tojson]").unwrap();
        assert_eq!(result, expect("12345678909876543212345", "[., tojson]", &["[12345678909876543212345,\"12345678909876543212345\"]"]));
    }

    #[test]
    fn identity_big_decimal_comparison() {
        let result = query_json("0.12345678901234567890123456789", ". < 0.12345678901234567890123456788").unwrap();
        assert_eq!(result, expect("0.12345678901234567890123456789", ". < 0.12345678901234567890123456788", &["false"]));
    }

    #[test]
    fn identity_tojson_preserves_literal() {
        let result = query_json("[1, 1.000, 1.0, 100e-2]", "map([., . == 1]) | tojson").unwrap();
        assert_eq!(result, expect("[1, 1.000, 1.0, 100e-2]", "map([., . == 1]) | tojson", &["\"[[1,true],[1.000,true],[1.0,true],[1.00,true]]\""]));
    }

    #[test]
    fn identity_big_number_comparison() {
        let result = query_json("10000000000000000000000000000001", ". as $big | [$big, $big + 1] | map(. > 10000000000000000000000000000000)").unwrap();
        assert_eq!(result, expect("10000000000000000000000000000001", ". as $big | [$big, $big + 1] | map(. > 10000000000000000000000000000000)", &["[true, false]"]));
    }
}

#[cfg(test)]
mod faq_types_and_values {
    use super::*;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    #[test]
    fn array_construction_user_projects() {
        let result = query_json(r#"{"user":"stedolan", "projects": ["jq", "wikiflow"]}"#, "[.user, .projects[]]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"stedolan\", \"jq\", \"wikiflow\"]")]));
    }

    #[test]
    fn array_construction_double_elements() {
        let result = query_json("[1, 2, 3]", "[ .[] | . * 2]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[2, 4, 6]")]));
    }

    #[test]
    fn object_construction_multiple_outputs() {
        let result = query_json(r#"{"user":"stedolan","titles":["JQ Primer", "More JQ"]}"#, "{user, title: .titles[]}").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"user\":\"stedolan\", \"title\": \"JQ Primer\"}"),
            node("{\"user\":\"stedolan\", \"title\": \"More JQ\"}"),
        ]));
    }

    #[test]
    fn object_construction_dynamic_key() {
        let result = query_json(r#"{"user":"stedolan","titles":["JQ Primer", "More JQ"]}"#, "{(.user): .titles}").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"stedolan\": [\"JQ Primer\", \"More JQ\"]}")]));
    }

    #[test]
    fn recursive_descent() {
        let result = query_json("[[{\"a\":1}]]", ".. | .a?").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }
}

#[cfg(test)]
mod faq_assignment {
    use super::*;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    #[test]
    fn update_assignment_booleans() {
        let result = query_json("[true,false,[5,true,[true,[false]],false]]", "(..|select(type==\"boolean\")) |= if . then 1 else 0 end").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,0,[5,1,[1,[0]],0]]")]));
    }

    #[test]
    fn arithmetic_update_assignment_plus() {
        let result = query_json("{\"foo\": 42}", ".foo += 1").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"foo\": 43}")]));
    }

    #[test]
    fn plain_assignment_a_equals_b() {
        let result = query_json("{\"a\": {\"b\": 10}, \"b\": 20}", ".a = .b").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\":20,\"b\":20}")]));
    }

    #[test]
    fn plain_assignment_update_a_from_b() {
        let result = query_json("{\"a\": {\"b\": 10}, \"b\": 20}", ".a |= .b").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\":10,\"b\":20}")]));
    }

    #[test]
    fn plain_assignment_range_multiple_outputs() {
        let result = query_json("null", "(.a, .b) = range(3)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"a\":0,\"b\":0}"),
            node("{\"a\":1,\"b\":1}"),
            node("{\"a\":2,\"b\":2}"),
        ]));
    }

    #[test]
    fn update_assignment_range_first_value() {
        let result = query_json("null", "(.a, .b) |= range(3)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\":0,\"b\":0}")]));
    }
}

#[cfg(test)]
mod faq_advanced_features {
    use super::*;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    #[test]
    fn variable_binding_basic() {
        let result = query_json("{\"foo\":10, \"bar\":200}", ".bar as $x | .foo | . + $x").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("210")]));
    }

    #[test]
    fn variable_binding_scope() {
        let result = query_json("5", ". as $i|[(.*2|. as $i| $i), $i]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[10,5]")]));
    }

    #[test]
    fn variable_binding_destructuring_array_object() {
        let result = query_json("[2, 3, {\"c\": 4, \"d\": 5}]", ". as [$a, $b, {c: $c}] | $a + $b + $c").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("9")]));
    }

    #[test]
    fn variable_binding_destructuring_array_multiple() {
        let result = query_json("[[0], [0, 1], [2, 1, 0]]", ".[] as [$a, $b] | {a: $a, b: $b}").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"a\":0,\"b\":null}"),
            node("{\"a\":0,\"b\":1}"),
            node("{\"a\":2,\"b\":1}"),
        ]));
    }

    #[test]
    fn destructuring_alternative_object() {
        let result = query_json(
            "[{\"a\": 1, \"b\": 2, \"c\": {\"d\": 3, \"e\": 4}}, {\"a\": 1, \"b\": 2, \"c\": [{\"d\": 3, \"e\": 4}]}]",
            ".[] as {$a, $b, c: {$d, $e}} ?// {$a, $b, c: [{$d, $e}]} | {$a, $b, $d, $e}"
        ).unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"a\":1,\"b\":2,\"d\":3,\"e\":4}"),
            node("{\"a\":1,\"b\":2,\"d\":3,\"e\":4}"),
        ]));
    }

    #[test]
    fn destructuring_alternative_partial_match() {
        let result = query_json(
            "[{\"a\": 1, \"b\": 2, \"c\": {\"d\": 3, \"e\": 4}}, {\"a\": 1, \"b\": 2, \"c\": [{\"d\": 3, \"e\": 4}]}]",
            ".[] as {$a, $b, c: {$d}} ?// {$a, $b, c: [{$e}]} | {$a, $b, $d, $e}"
        ).unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"a\":1,\"b\":2,\"d\":3,\"e\":null}"),
            node("{\"a\":1,\"b\":2,\"d\":null,\"e\":4}"),
        ]));
    }

    #[test]
    fn destructuring_alternative_error_fallback() {
        let result = query_json("[[3]]", ".[] as [$a] ?// [$b] | if $a != null then error(\"err: \\($a)\") else {$a,$b} end").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\":null,\"b\":3}")]));
    }

    #[test]
    fn defining_functions_addvalue_filter() {
        let result = query_json("[[1,2],[10,20]]", "def addvalue(f): . + [f]; map(addvalue(.[0]))").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[[1,2,1], [10,20,10]]")]));
    }

    #[test]
    fn defining_functions_addvalue_variable() {
        let result = query_json("[[1,2],[10,20]]", "def addvalue(f): f as $x | map(. + $x); addvalue(.[0])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[[1,2,1,2], [10,20,1,2]]")]));
    }

    #[test]
    fn isempty_empty() {
        let result = query_json("null", "isempty(empty)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn isempty_empty_array() {
        let result = query_json("[]", "isempty(.[])")  .unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn isempty_non_empty_array() {
        let result = query_json("[1,2,3]", "isempty(.[])")  .unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn limit_first_three() {
        let result = query_json("[0,1,2,3,4,5,6,7,8,9]", "[limit(3;.[])]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[0,1,2]")]));
    }

    #[test]
    fn first_last_nth_range() {
        let result = query_json("10", "[first(range(.)), last(range(.)), nth(./2; range(.))]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[0,9,5]")]));
    }

    #[test]
    fn first_last_nth_array() {
        let result = query_json("10", "[range(.)]|[first, last, nth(5)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[0,9,5]")]));
    }

    #[test]
    fn reduce_sum() {
        let result = query_json("[1,2,3,4,5]", "reduce .[] as $item (0; . + $item)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("15")]));
    }

    #[test]
    fn reduce_array_destructuring() {
        let result = query_json("[[1,2],[3,4],[5,6]]", "reduce .[] as [$i,$j] (0; . + $i * $j)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("44")]));
    }

    #[test]
    fn reduce_object_destructuring() {
        let result = query_json("[{\"x\":\"a\",\"y\":1},{\"x\":\"b\",\"y\":2},{\"x\":\"c\",\"y\":3}]", "reduce .[] as {$x,$y} (null; .x += $x | .y += [$y])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"x\":\"abc\",\"y\":[1,2,3]}")]));
    }

    #[test]
    fn foreach_basic() {
        let result = query_json("[1,2,3,4,5]", "foreach .[] as $item (0; . + $item)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("1"), node("3"), node("6"), node("10"), node("15"),
        ]));
    }

    #[test]
    fn foreach_with_extract() {
        let result = query_json("[1,2,3,4,5]", "foreach .[] as $item (0; . + $item; [$item, . * 2])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("[1,2]"), node("[2,6]"), node("[3,12]"), node("[4,20]"), node("[5,30]"),
        ]));
    }

    #[test]
    fn foreach_index_item() {
        let result = query_json("[\"foo\", \"bar\", \"baz\"]", "foreach .[] as $item (0; . + 1; {index: ., $item})").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"index\":1,\"item\":\"foo\"}"),
            node("{\"index\":2,\"item\":\"bar\"}"),
            node("{\"index\":3,\"item\":\"baz\"}"),
        ]));
    }

    #[test]
    fn generators_custom_range() {
        let result = query_json("null", "def range(init; upto; by): def _range: if (by > 0 and . < upto) or (by < 0 and . > upto) then ., ((.+by)|_range) else . end; if by == 0 then init else init|_range end | select((by > 0 and . < upto) or (by < 0 and . > upto)); range(0; 10; 3)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("0"), node("3"), node("6"), node("9"),
        ]));
    }

    #[test]
    fn generators_custom_while() {
        let result = query_json("1", "def while(cond; update): def _while: if cond then ., (update | _while) else empty end; _while; [while(.<100; .*2)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,2,4,8,16,32,64]")]));
    }
}

#[cfg(test)]
mod faq_builtin_operators_and_functions {
    use super::*;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    #[test]
    fn add_number() {
        let result = query_json("{\"a\": 7}", ".a + 1").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("8")]));
    }

    #[test]
    fn add_arrays() {
        let result = query_json("{\"a\": [1,2], \"b\": [3,4]}", ".a + .b").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,2,3,4]")]));
    }

    #[test]
    fn add_null() {
        let result = query_json("{\"a\": 1}", ".a + null").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn add_missing_field_plus_one() {
        let result = query_json("{}", ".a + 1").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn add_objects_merge() {
        let result = query_json("null", "{a: 1} + {b: 2} + {c: 3} + {a: 42}").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\": 42, \"b\": 2, \"c\": 3}")]));
    }

    #[test]
    fn subtract_number() {
        let result = query_json("{\"a\":3}", "4 - .a").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn subtract_array_elements() {
        let result = query_json("[\"xml\", \"yaml\", \"json\"]", ". - [\"xml\", \"yaml\"]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"json\"]")]));
    }

    #[test]
    fn multiply_divide() {
        let result = query_json("5", "10 / . * 3").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("6")]));
    }

    #[test]
    fn divide_string() {
        let result = query_json("\"a, b,c,d, e\"", ". / \", \"").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"a\",\"b,c,d\",\"e\"]")]));
    }

    #[test]
    fn multiply_objects_recursive_merge() {
        let result = query_json("null", "{\"k\": {\"a\": 1, \"b\": 2}} * {\"k\": {\"a\": 0,\"c\": 3}}").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"k\": {\"a\": 0, \"b\": 2, \"c\": 3}}")]));
    }

    #[test]
    fn divide_by_zero_suppressed() {
        let result = query_json("[1,0,-1]", ".[] | (1 / .)?").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1"), node("-1")]));
    }

    #[test]
    fn abs_array() {
        let result = query_json("[-10, -1.1, -1e-1]", "map(abs)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[10,1.1,1e-1]")]));
    }

    #[test]
    fn length_various_types() {
        let result = query_json("[[1,2], \"string\", {\"a\":2}, null, -5]", ".[] | length").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("2"), node("6"), node("1"), node("0"), node("5"),
        ]));
    }

    #[test]
    fn utf8bytelength() {
        let result = query_json("\"\\u03bc\"", "utf8bytelength").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("2")]));
    }

    #[test]
    fn keys_object_sorted() {
        let result = query_json("{\"abc\": 1, \"abcd\": 2, \"Foo\": 3}", "keys").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"Foo\", \"abc\", \"abcd\"]")]));
    }

    #[test]
    fn keys_array_indices() {
        let result = query_json("[42,3,35]", "keys").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[0,1,2]")]));
    }

    #[test]
    fn has_key_object() {
        let result = query_json("[{\"foo\": 42}, {}]", "map(has(\"foo\"))").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[true, false]")]));
    }

    #[test]
    fn has_key_array_index() {
        let result = query_json("[[0,1], [\"a\",\"b\",\"c\"]]", "map(has(2))").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[false, true]")]));
    }

    #[test]
    fn in_object() {
        let result = query_json("[\"foo\", \"bar\"]", ".[] | in({\"foo\": 42})").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true"), node("false")]));
    }

    #[test]
    fn in_array() {
        let result = query_json("[2, 0]", "map(in([0,1]))").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[false, true]")]));
    }

    #[test]
    fn map_plus_one() {
        let result = query_json("[1,2,3]", "map(.+1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[2,3,4]")]));
    }

    #[test]
    fn map_values_plus_one() {
        let result = query_json("{\"a\": 1, \"b\": 2, \"c\": 3}", "map_values(.+1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\": 2, \"b\": 3, \"c\": 4}")]));
    }

    #[test]
    fn map_duplicate() {
        let result = query_json("[1,2]", "map(., .)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,1,2,2]")]));
    }

    #[test]
    fn map_values_filter_empty() {
        let result = query_json("{\"a\": null, \"b\": true, \"c\": false}", "map_values(. // empty)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"b\":true}")]));
    }

    #[test]
    fn pick_object_fields() {
        let result = query_json("{\"a\": 1, \"b\": {\"c\": 2, \"d\": 3}, \"e\": 4}", "pick(.a, .b.c, .x)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\":1,\"b\":{\"c\":2},\"x\":null}")]));
    }

    #[test]
    fn pick_array_indices() {
        let result = query_json("[1,2,3,4]", "pick(.[2], .[0], .[0])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,null,3]")]));
    }

    #[test]
    fn path_expression() {
        let result = query_json("null", "path(.a[0].b)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"a\",0,\"b\"]")]));
    }

    #[test]
    fn path_recursive() {
        let result = query_json("{\"a\":[{\"b\":1}]}", "[path(..)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[[],[\"a\"],[\"a\",0],[\"a\",0,\"b\"]]")]));
    }

    #[test]
    fn del_field() {
        let result = query_json("{\"foo\": 42, \"bar\": 9001, \"baz\": 42}", "del(.foo)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"bar\": 9001, \"baz\": 42}")]));
    }

    #[test]
    fn del_array_indices() {
        let result = query_json("[\"foo\", \"bar\", \"baz\"]", "del(.[1, 2])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"foo\"]")]));
    }

    #[test]
    fn getpath_null() {
        let result = query_json("null", "getpath([\"a\",\"b\"])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("null")]));
    }

    #[test]
    fn setpath_null_input() {
        let result = query_json("null", "setpath([\"a\",\"b\"]; 1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\": {\"b\": 1}}")]));
    }

    #[test]
    fn setpath_existing() {
        let result = query_json("{\"a\":{\"b\":0}}", "setpath([\"a\",\"b\"]; 1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\": {\"b\": 1}}")]));
    }

    #[test]
    fn setpath_array() {
        let result = query_json("null", "setpath([0,\"a\"]; 1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[{\"a\":1}]")]));
    }

    #[test]
    fn delpaths() {
        let result = query_json("{\"a\":{\"b\":1},\"x\":{\"y\":2}}", "delpaths([[\"a\",\"b\"]])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\":{},\"x\":{\"y\":2}}")]));
    }

    #[test]
    fn to_entries() {
        let result = query_json("{\"a\": 1, \"b\": 2}", "to_entries").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[{\"key\":\"a\", \"value\":1}, {\"key\":\"b\", \"value\":2}]")]));
    }

    #[test]
    fn from_entries() {
        let result = query_json("[{\"key\":\"a\", \"value\":1}, {\"key\":\"b\", \"value\":2}]", "from_entries").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"a\": 1, \"b\": 2}")]));
    }

    #[test]
    fn with_entries_rename_key() {
        let result = query_json("{\"a\": 1, \"b\": 2}", "with_entries(.key |= \"KEY_\" + .)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"KEY_a\": 1, \"KEY_b\": 2}")]));
    }

    #[test]
    fn select_gte() {
        let result = query_json("[1,5,3,0,7]", "map(select(. >= 2))").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[5,3,7]")]));
    }

    #[test]
    fn select_by_field() {
        let result = query_json("[{\"id\": \"first\", \"val\": 1}, {\"id\": \"second\", \"val\": 2}]", ".[] | select(.id == \"second\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"id\": \"second\", \"val\": 2}")]));
    }

    #[test]
    fn type_filter_numbers() {
        let result = query_json("[[],{},1,\"foo\",null,true,false]", ".[]|numbers").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn empty_in_expression() {
        let result = query_json("null", "1, empty, 2").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1"), node("2")]));
    }

    #[test]
    fn empty_in_array() {
        let result = query_json("null", "[1,2,empty,3]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,2,3]")]));
    }

    #[test]
    fn error_catch_input() {
        let result = query_json("\"error message\"", "try error catch .").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"error message\"")]));
    }

    #[test]
    fn error_message_interpolation() {
        let result = query_json("42", "try error(\"invalid value: \\(.)\") catch .").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"invalid value: 42\"")]));
    }

    #[test]
    fn paths_all() {
        let result = query_json("[1,[[],{\"a\":2}]]", "[paths]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[[0],[1],[1,0],[1,1],[1,1,\"a\"]]")]));
    }

    #[test]
    fn paths_numbers_only() {
        let result = query_json("[1,[[],{\"a\":2}]]", "[paths(type == \"number\")]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[[0],[1,1,\"a\"]]")]));
    }

    #[test]
    fn add_strings() {
        let result = query_json("[\"a\",\"b\",\"c\"]", "add").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"abc\"")]));
    }

    #[test]
    fn add_numbers() {
        let result = query_json("[1, 2, 3]", "add").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("6")]));
    }

    #[test]
    fn add_empty_array() {
        let result = query_json("[]", "add").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("null")]));
    }

    #[test]
    fn any_true_false() {
        let result = query_json("[true, false]", "any").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn any_all_false() {
        let result = query_json("[false, false]", "any").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn any_empty() {
        let result = query_json("[]", "any").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn all_mixed() {
        let result = query_json("[true, false]", "all").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn all_true() {
        let result = query_json("[true, true]", "all").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn all_empty() {
        let result = query_json("[]", "all").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn flatten_nested() {
        let result = query_json("[1, [2], [[3]]]", "flatten").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1, 2, 3]")]));
    }

    #[test]
    fn flatten_depth_one() {
        let result = query_json("[1, [2], [[3]]]", "flatten(1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1, 2, [3]]")]));
    }

    #[test]
    fn flatten_empty_nested() {
        let result = query_json("[[]]", "flatten").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[]")]));
    }

    #[test]
    fn flatten_objects_not_flattened() {
        let result = query_json("[{\"foo\": \"bar\"}, [{\"foo\": \"baz\"}]]", "flatten").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[{\"foo\": \"bar\"}, {\"foo\": \"baz\"}]")]));
    }

    #[test]
    fn range_from_to() {
        let result = query_json("null", "range(2; 4)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("2"), node("3")]));
    }

    #[test]
    fn range_collect() {
        let result = query_json("null", "[range(2; 4)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[2,3]")]));
    }

    #[test]
    fn range_upto() {
        let result = query_json("null", "[range(4)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[0,1,2,3]")]));
    }

    #[test]
    fn range_with_step() {
        let result = query_json("null", "[range(0; 10; 3)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[0,3,6,9]")]));
    }

    #[test]
    fn range_negative_step_empty() {
        let result = query_json("null", "[range(0; 10; -1)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[]")]));
    }

    #[test]
    fn range_negative_step_down() {
        let result = query_json("null", "[range(0; -5; -1)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[0,-1,-2,-3,-4]")]));
    }

    #[test]
    fn floor_pi() {
        let result = query_json("3.14159", "floor").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("3")]));
    }

    #[test]
    fn sqrt_nine() {
        let result = query_json("9", "sqrt").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("3")]));
    }

    #[test]
    fn tonumber_from_string_and_number() {
        let result = query_json("[1, \"1\"]", ".[] | tonumber").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1"), node("1")]));
    }

    #[test]
    fn tostring_various() {
        let result = query_json("[1, \"1\", [1]]", ".[] | tostring").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"1\""), node("\"1\""), node("\"[1]\"")]));
    }

    #[test]
    fn type_of_values() {
        let result = query_json("[0, false, [], {}, null, \"hello\"]", "map(type)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"number\", \"boolean\", \"array\", \"object\", \"null\", \"string\"]")]));
    }

    #[test]
    fn infinite_sign() {
        let result = query_json("[-1, 1]", ".[] | (infinite * .) < 0").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true"), node("false")]));
    }

    #[test]
    fn infinite_nan_type() {
        let result = query_json("null", "infinite, nan | type").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"number\""), node("\"number\"")]));
    }

    #[test]
    fn sort_array() {
        let result = query_json("[8,3,null,6]", "sort").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[null,3,6,8]")]));
    }

    #[test]
    fn sort_by_field() {
        let result = query_json("[{\"foo\":4, \"bar\":10}, {\"foo\":3, \"bar\":10}, {\"foo\":2, \"bar\":1}]", "sort_by(.foo)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[{\"foo\":2, \"bar\":1}, {\"foo\":3, \"bar\":10}, {\"foo\":4, \"bar\":10}]")]));
    }

    #[test]
    fn sort_by_two_fields() {
        let result = query_json("[{\"foo\":4, \"bar\":10}, {\"foo\":3, \"bar\":20}, {\"foo\":2, \"bar\":1}, {\"foo\":3, \"bar\":10}]", "sort_by(.foo, .bar)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[{\"foo\":2, \"bar\":1}, {\"foo\":3, \"bar\":10}, {\"foo\":3, \"bar\":20}, {\"foo\":4, \"bar\":10}]")]));
    }

    #[test]
    fn group_by_field() {
        let result = query_json("[{\"foo\":1, \"bar\":10}, {\"foo\":3, \"bar\":100}, {\"foo\":1, \"bar\":1}]", "group_by(.foo)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[[{\"foo\":1, \"bar\":10}, {\"foo\":1, \"bar\":1}], [{\"foo\":3, \"bar\":100}]]")]));
    }

    #[test]
    fn min_array() {
        let result = query_json("[5,4,2,7]", "min").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("2")]));
    }

    #[test]
    fn max_by_field() {
        let result = query_json("[{\"foo\":1, \"bar\":14}, {\"foo\":2, \"bar\":3}]", "max_by(.foo)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"foo\":2, \"bar\":3}")]));
    }

    #[test]
    fn unique_numbers() {
        let result = query_json("[1,2,5,3,5,3,1,3]", "unique").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,2,3,5]")]));
    }

    #[test]
    fn unique_by_field() {
        let result = query_json("[{\"foo\": 1, \"bar\": 2}, {\"foo\": 1, \"bar\": 3}, {\"foo\": 4, \"bar\": 5}]", "unique_by(.foo)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[{\"foo\": 1, \"bar\": 2}, {\"foo\": 4, \"bar\": 5}]")]));
    }

    #[test]
    fn unique_by_length() {
        let result = query_json("[\"chunky\", \"bacon\", \"kitten\", \"cicada\", \"asparagus\"]", "unique_by(length)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"bacon\", \"chunky\", \"asparagus\"]")]));
    }

    #[test]
    fn reverse_array() {
        let result = query_json("[1,2,3,4]", "reverse").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[4,3,2,1]")]));
    }

    #[test]
    fn contains_string() {
        let result = query_json("\"foobar\"", "contains(\"bar\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn contains_array_true() {
        let result = query_json("[\"foobar\", \"foobaz\", \"blarp\"]", "contains([\"baz\", \"bar\"])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn contains_array_false() {
        let result = query_json("[\"foobar\", \"foobaz\", \"blarp\"]", "contains([\"bazzzzz\", \"bar\"])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn contains_object_true() {
        let result = query_json("{\"foo\": 12, \"bar\":[1,2,{\"barp\":12, \"blip\":13}]}", "contains({foo: 12, bar: [{barp: 12}]})").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn contains_object_false() {
        let result = query_json("{\"foo\": 12, \"bar\":[1,2,{\"barp\":12, \"blip\":13}]}", "contains({foo: 12, bar: [{barp: 15}]})").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn indices_string() {
        let result = query_json("\"a,b, cd, efg, hijk\"", "indices(\", \")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[3,7,12]")]));
    }

    #[test]
    fn indices_array_element() {
        let result = query_json("[0,1,2,1,3,1,4]", "indices(1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,3,5]")]));
    }

    #[test]
    fn indices_subarray() {
        let result = query_json("[0,1,2,3,1,4,2,5,1,2,6,7]", "indices([1,2])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,8]")]));
    }

    #[test]
    fn index_string() {
        let result = query_json("\"a,b, cd, efg, hijk\"", "index(\", \")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("3")]));
    }

    #[test]
    fn index_array_element() {
        let result = query_json("[0,1,2,1,3,1,4]", "index(1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn index_subarray() {
        let result = query_json("[0,1,2,3,1,4,2,5,1,2,6,7]", "index([1,2])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn rindex_string() {
        let result = query_json("\"a,b, cd, efg, hijk\"", "rindex(\", \")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("12")]));
    }

    #[test]
    fn rindex_array_element() {
        let result = query_json("[0,1,2,1,3,1,4]", "rindex(1)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("5")]));
    }

    #[test]
    fn rindex_subarray() {
        let result = query_json("[0,1,2,3,1,4,2,5,1,2,6,7]", "rindex([1,2])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("8")]));
    }

    #[test]
    fn inside_string() {
        let result = query_json("\"bar\"", "inside(\"foobar\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn inside_array_true() {
        let result = query_json("[\"baz\", \"bar\"]", "inside([\"foobar\", \"foobaz\", \"blarp\"])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn inside_array_false() {
        let result = query_json("[\"bazzzzz\", \"bar\"]", "inside([\"foobar\", \"foobaz\", \"blarp\"])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn inside_object_true() {
        let result = query_json("{\"foo\": 12, \"bar\": [{\"barp\": 12}]}", "inside({\"foo\": 12, \"bar\":[1,2,{\"barp\":12, \"blip\":13}]})").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn inside_object_false() {
        let result = query_json("{\"foo\": 12, \"bar\": [{\"barp\": 15}]}", "inside({\"foo\": 12, \"bar\":[1,2,{\"barp\":12, \"blip\":13}]})").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn startswith() {
        let result = query_json("[\"fo\", \"foo\", \"barfoo\", \"foobar\", \"barfoob\"]", "[.[]|startswith(\"foo\")]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[false, true, false, true, false]")]));
    }

    #[test]
    fn endswith() {
        let result = query_json("[\"foobar\", \"barfoo\"]", "[.[]|endswith(\"foo\")]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[false, true]")]));
    }

    #[test]
    fn combinations_2d() {
        let result = query_json("[[1,2], [3, 4]]", "combinations").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("[1, 3]"), node("[1, 4]"), node("[2, 3]"), node("[2, 4]"),
        ]));
    }

    #[test]
    fn combinations_n() {
        let result = query_json("[0, 1]", "combinations(2)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("[0, 0]"), node("[0, 1]"), node("[1, 0]"), node("[1, 1]"),
        ]));
    }

    #[test]
    fn ltrimstr() {
        let result = query_json("[\"fo\", \"foo\", \"barfoo\", \"foobar\", \"afoo\"]", "[.[]|ltrimstr(\"foo\")]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"fo\",\"\",\"barfoo\",\"bar\",\"afoo\"]")]));
    }

    #[test]
    fn rtrimstr() {
        let result = query_json("[\"fo\", \"foo\", \"barfoo\", \"foobar\", \"foob\"]", "[.[]|rtrimstr(\"foo\")]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"fo\",\"\",\"bar\",\"foobar\",\"foob\"]")]));
    }

    #[test]
    fn explode() {
        let result = query_json("\"foobar\"", "explode").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[102,111,111,98,97,114]")]));
    }

    #[test]
    fn implode() {
        let result = query_json("[65, 66, 67]", "implode").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"ABC\"")]));
    }

    #[test]
    fn split_string() {
        let result = query_json("\"a, b,c,d, e, \"", "split(\", \")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"a\",\"b,c,d\",\"e\",\"\"]")]));
    }

    #[test]
    fn join_strings() {
        let result = query_json("[\"a\",\"b,c,d\",\"e\"]", "join(\", \")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"a, b,c,d, e\"")]));
    }

    #[test]
    fn join_mixed_types() {
        let result = query_json("[\"a\",1,2.3,true,null,false]", "join(\" \")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"a 1 2.3 true false\"")]));
    }

    #[test]
    fn ascii_upcase() {
        let result = query_json("\"useful but not for é\"", "ascii_upcase").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"USEFUL BUT NOT FOR é\"")]));
    }

    #[test]
    fn while_builtin() {
        let result = query_json("1", "[while(.<100; .*2)]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,2,4,8,16,32,64]")]));
    }

    #[test]
    fn repeat_with_error() {
        let result = query_json("1", "[repeat(.*2, error)?]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[2]")]));
    }

    #[test]
    fn until_factorial() {
        let result = query_json("4", "[.,1]|until(.[0] < 1; [.[0] - 1, .[1] * .[0]])|.[1]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("24")]));
    }

    #[test]
    fn recurse_foo_field() {
        let result = query_json("{\"foo\":[{\"foo\": []}, {\"foo\":[{\"foo\":[]}]}]}", "recurse(.foo[])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"foo\":[{\"foo\":[]},{\"foo\":[{\"foo\":[]}]}]}"),
            node("{\"foo\":[]}"),
            node("{\"foo\":[{\"foo\":[]}]}"),
            node("{\"foo\":[]}"),
        ]));
    }

    #[test]
    fn recurse_all() {
        let result = query_json("{\"a\":0,\"b\":[1]}", "recurse").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"a\":0,\"b\":[1]}"), node("0"), node("[1]"), node("1"),
        ]));
    }

    #[test]
    fn recurse_with_condition() {
        let result = query_json("2", "recurse(. * .; . < 20)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("2"), node("4"), node("16")]));
    }

    #[test]
    fn walk_sort_arrays() {
        let result = query_json("[[4, 1, 7], [8, 5, 2], [3, 6, 9]]", "walk(if type == \"array\" then sort else . end)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[[1,4,7],[2,5,8],[3,6,9]]")]));
    }

    #[test]
    fn walk_rename_keys() {
        let result = query_json("[ { \"_a\": { \"__b\": 2 } } ]", "walk( if type == \"object\" then with_entries( .key |= sub( \"^_+\"; \"\") ) else . end )").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[{\"a\":{\"b\":2}}]")]));
    }

    #[test]
    fn transpose() {
        let result = query_json("[[1], [2,3]]", "transpose").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[[1,2],[null,3]]")]));
    }

    #[test]
    fn bsearch_found() {
        let result = query_json("[0,1]", "bsearch(0)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("0")]));
    }

    #[test]
    fn bsearch_not_found() {
        let result = query_json("[1,2,3]", "bsearch(0)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("-1")]));
    }

    #[test]
    fn bsearch_insert() {
        let result = query_json("[1,2,3]", "bsearch(4) as $ix | if $ix < 0 then .[-(1+$ix)] = 4 else . end").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,2,3,4]")]));
    }

    #[test]
    fn string_interpolation() {
        let result = query_json("42", "\"The input was \\(.), which is one less than \\(.+1)\"").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"The input was 42, which is one less than 43\"")]));
    }

    #[test]
    fn tostring_various_types() {
        let result = query_json("[1, \"foo\", [\"foo\"]]", "[.[]|tostring]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"1\",\"foo\",\"[\\\"foo\\\"]\"]")]));
    }

    #[test]
    fn tojson_various_types() {
        let result = query_json("[1, \"foo\", [\"foo\"]]", "[.[]|tojson]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"1\",\"\\\"foo\\\"\",\"[\\\"foo\\\"]\"]")]));
    }

    #[test]
    fn tojson_fromjson_roundtrip() {
        let result = query_json("[1, \"foo\", [\"foo\"]]", "[.[]|tojson|fromjson]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1,\"foo\",[\"foo\"]]")]));
    }

    #[test]
    fn format_html() {
        let result = query_json("\"This works if x < y\"", "@html").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"This works if x &lt; y\"")]));
    }

    #[test]
    fn format_base64_encode() {
        let result = query_json("\"This is a message\"", "@base64").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"VGhpcyBpcyBhIG1lc3NhZ2U=\"")]));
    }

    #[test]
    fn format_base64_decode() {
        let result = query_json("\"VGhpcyBpcyBhIG1lc3NhZ2U=\"", "@base64d").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"This is a message\"")]));
    }

    #[test]
    fn fromdate() {
        let result = query_json("\"2015-03-05T23:51:47Z\"", "fromdate").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1425599507")]));
    }

    #[test]
    fn strptime() {
        let result = query_json("\"2015-03-05T23:51:47Z\"", "strptime(\"%Y-%m-%dT%H:%M:%SZ\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[2015,2,5,23,51,47,4,63]")]));
    }

    #[test]
    fn strptime_mktime() {
        let result = query_json("\"2015-03-05T23:51:47Z\"", "strptime(\"%Y-%m-%dT%H:%M:%SZ\")|mktime").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1425599507")]));
    }
}

#[cfg(test)]
mod faq_conditionals_and_comparisons {
    use super::*;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    #[test]
    fn eq_null_vs_false() {
        let result = query_json("null", ". == false").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("false")]));
    }

    #[test]
    fn eq_objects_key_order_independent() {
        let result = query_json("{\"a\":1, \"b\": {\"c\": 3, \"d\": 4}}", ". == {\"b\": {\"d\": (4 + 1e-20), \"c\": 3}, \"a\":1}").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn eq_number_string() {
        let result = query_json("[1, 1.0, \"1\", \"banana\"]", ".[] == 1").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("true"), node("true"), node("false"), node("false"),
        ]));
    }

    #[test]
    fn if_elif_else() {
        let result = query_json("2", "if . == 0 then \"zero\" elif . == 1 then \"one\" else \"many\" end").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"many\"")]));
    }

    #[test]
    fn comparison_lt() {
        let result = query_json("2", ". < 5").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn and_truthy() {
        let result = query_json("null", "42 and \"a string\"").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn or_multiple_inputs() {
        let result = query_json("null", "(true, false) or false").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true"), node("false")]));
    }

    #[test]
    fn and_cartesian() {
        let result = query_json("null", "(true, true) and (true, false)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("true"), node("false"), node("true"), node("false"),
        ]));
    }

    #[test]
    fn not_operator() {
        let result = query_json("null", "[true, false | not]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[false, true]")]));
    }

    #[test]
    fn alternative_empty() {
        let result = query_json("null", "empty // 42").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("42")]));
    }

    #[test]
    fn alternative_existing_value() {
        let result = query_json("{\"foo\": 19}", ".foo // 42").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("19")]));
    }

    #[test]
    fn alternative_missing_field() {
        let result = query_json("{}", ".foo // 42").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("42")]));
    }

    #[test]
    fn alternative_generator_skips_false_null() {
        let result = query_json("null", "(false, null, 1) // 42").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn alternative_pipe_each() {
        let result = query_json("null", "(false, null, 1) | . // 42").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("42"), node("42"), node("1")]));
    }

    #[test]
    fn try_catch_not_object() {
        let result = query_json("true", "try .a catch \". is not an object\"").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\". is not an object\"")]));
    }

    #[test]
    fn try_suppress_errors() {
        let result = query_json("[{}, true, {\"a\":1}]", "[.[]|try .a]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[null, 1]")]));
    }

    #[test]
    fn try_catch_exception() {
        let result = query_json("true", "try error(\"some exception\") catch .").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"some exception\"")]));
    }

    #[test]
    fn optional_operator_suppress() {
        let result = query_json("[{}, true, {\"a\":1}]", "[.[] | .a?]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[null, 1]")]));
    }

    #[test]
    fn optional_operator_tonumber() {
        let result = query_json("[\"1\", \"invalid\", \"3\", 4]", "[.[] | tonumber?]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[1, 3, 4]")]));
    }
}

#[cfg(test)]
mod faq_regular_expressions {
    use super::*;
    use crate::node_json_factory::NodeJsonFactory;
    use crate::parser::{parse_json, Factory};

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    #[test]
    fn test_basic() {
        let result = query_json("\"foo\"", "test(\"foo\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true")]));
    }

    #[test]
    fn test_flags_ix() {
        let result = query_json("[\"xabcd\", \"ABC\"]", ".[] | test(\"a b c # spaces are ignored\"; \"ix\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("true"), node("true")]));
    }

    #[test]
    fn match_global_flag() {
        let result = query_json("\"abc abc\"", "match(\"(abc)+\"; \"g\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"offset\": 0, \"length\": 3, \"string\": \"abc\", \"captures\": [{\"offset\": 0, \"length\": 3, \"string\": \"abc\", \"name\": null}]}"),
            node("{\"offset\": 4, \"length\": 3, \"string\": \"abc\", \"captures\": [{\"offset\": 4, \"length\": 3, \"string\": \"abc\", \"name\": null}]}"),
        ]));
    }

    #[test]
    fn match_simple() {
        let result = query_json("\"foo bar foo\"", "match(\"foo\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{\"offset\": 0, \"length\": 3, \"string\": \"foo\", \"captures\": []}")]));
    }

    #[test]
    fn match_array_syntax_with_flags() {
        let result = query_json("\"foo bar FOO\"", "match([\"foo\", \"ig\"])").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"offset\": 0, \"length\": 3, \"string\": \"foo\", \"captures\": []}"),
            node("{\"offset\": 8, \"length\": 3, \"string\": \"FOO\", \"captures\": []}"),
        ]));
    }

    #[test]
    fn match_named_capture() {
        let result = query_json("\"foo bar foo foo foo\"", "match(\"foo (?<bar123>bar)? foo\"; \"ig\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("{\"offset\": 0, \"length\": 11, \"string\": \"foo bar foo\", \"captures\": [{\"offset\": 4, \"length\": 3, \"string\": \"bar\", \"name\": \"bar123\"}]}"),
            node("{\"offset\": 12, \"length\": 8, \"string\": \"foo foo\", \"captures\": [{\"offset\": -1, \"length\": 0, \"string\": null, \"name\": \"bar123\"}]}"),
        ]));
    }

    #[test]
    fn match_length() {
        let result = query_json("\"abc\"", "[ match(\".\"; \"g\")] | length").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("3")]));
    }

    #[test]
    fn capture_named_groups() {
        let result = query_json("\"xyzzy-14\"", "capture(\"(?<a>[a-z]+)-(?<n>[0-9]+)\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("{ \"a\": \"xyzzy\", \"n\": \"14\" }")]));
    }

    #[test]
    fn scan_occurrences() {
        let result = query_json("\"abcdefabc\"", "scan(\"c\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"c\""), node("\"c\"")]));
    }

    #[test]
    fn split_regex() {
        let result = query_json("\"ab,cd, ef\"", "split(\", *\"; null)").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"ab\",\"cd\",\"ef\"]")]));
    }

    #[test]
    fn splits_stream() {
        let result = query_json("\"ab,cd, ef, gh\"", "splits(\", *\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![
            node("\"ab\""), node("\"cd\""), node("\"ef\""), node("\"gh\""),
        ]));
    }

    #[test]
    fn sub_global_flag() {
        let result = query_json("\"123abc456def\"", "sub(\"[^a-z]*(?<x>[a-z]+)\"; \"Z\\(.x)\"; \"g\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"ZabcZdef\"")]));
    }

    #[test]
    fn sub_multiple_replacements() {
        let result = query_json("\"aB\"", "[sub(\"(?<a>.)\"; \"\\(.a|ascii_upcase)\", \"\\(.a|ascii_downcase)\")]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"AB\",\"aB\"]")]));
    }

    #[test]
    fn gsub_named_capture() {
        let result = query_json("\"Abcabc\"", "gsub(\"(?<x>.)[^a]*\"; \"+\\(.x)-\")").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("\"+A-+a-\"")]));
    }

    #[test]
    fn gsub_multiple_replacements() {
        let result = query_json("\"p\"", "[gsub(\"p\"; \"a\", \"b\")]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("[\"a\",\"b\"]")]));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parser::Factory;

    const JSON: &str = r#"
        {
            "a": 1,
            "b": 2,
            "c": {
                "d": 3,
                "e": [ 4, 5, 6 ]
            }
        }
    "#;

    fn node(json: &str) -> Node {
        parse_json(json.as_bytes(), NodeJsonFactory).unwrap()
    }

    #[test]
    fn query_json_works() {
        let result = query_json(JSON, ".a").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn query_json_with_comments() {
        let json = r#"
        {
            // comment before
            "a": 1,
            "b": 2 // comment after
        }
        "#;

        let result = query_json(json, ".a").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1")]));
    }

    #[test]
    fn query_json_with_comments_incorrect() {
        let json = r#"
        {
            / comment before
            "a": 1,
            "b": 2 // comment after
        }
        "#;

        let result = query_json(json, ".a");
        assert!(result.is_err());
    }

    #[test]
    fn query_json_with_empty_string() {
        let result = query_json("{}", ".[]").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![]));
    }

    #[test]
    fn query_json_empty_query_gives_readable_error() {
        let err = query_json(JSON, "").unwrap_err();
        assert_eq!(err.to_string(), "unexpected end of input, expected term");
    }

    #[test]
    fn query_json_unexpected_token_gives_readable_error() {
        let err = query_json(JSON, ". | ]").unwrap_err();
        assert_eq!(err.to_string(), "unexpected character ']'");
    }

    // --- to_return_value branch coverage ---

    #[test]
    fn query_returns_null_value() {
        let result = query_json(r#"{"a": null}"#, ".a").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![NodeJsonFactory.null()]));
    }

    #[test]
    fn query_returns_boolean_true() {
        let result = query_json(r#"{"flag": true}"#, ".flag").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![NodeJsonFactory.bool(true)]));
    }

    #[test]
    fn query_returns_boolean_false() {
        let result = query_json(r#"{"flag": false}"#, ".flag").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![NodeJsonFactory.bool(false)]));
    }

    #[test]
    fn query_returns_plain_string() {
        let result = query_json(r#"{"name": "alice"}"#, ".name").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![NodeJsonFactory.string(b"alice".to_vec())]));
    }

    #[test]
    fn query_returns_string_with_url_variant() {
        let result = query_json(r#"{"link": "https://example.com"}"#, ".link").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![NodeJsonFactory.string(b"https://example.com".to_vec())]));
    }

    #[test]
    fn query_returns_string_with_email_variant() {
        let result = query_json(r#"{"email": "user@example.com"}"#, ".email").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![NodeJsonFactory.string(b"user@example.com".to_vec())]));
    }

    #[test]
    fn query_returns_integer_from_arithmetic() {
        // Val::Int branch: integer arithmetic produces Val::Int
        let result = query_json("{}", "1 + 2").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("3")]));
    }

    #[test]
    fn query_returns_float_literal() {
        // Val::Float branch: float literal in filter produces Val::Float
        let result = query_json("{}", "1.5").unwrap();
        assert_eq!(result, NodeJsonFactory.tuple(vec![node("1.5")]));
    }

    #[test]
    fn query_returns_array_value() {
        let result = query_json(r#"{"items": [1, 2]}"#, ".items").unwrap();
        assert_eq!(
            result,
            NodeJsonFactory.tuple(vec![NodeJsonFactory.array(vec![node("1"), node("2")])]),
        );
    }

    #[test]
    fn query_returns_object_value() {
        let result = query_json(r#"{"nested": {"x": 1}}"#, ".nested").unwrap();
        assert_eq!(
            result,
            NodeJsonFactory.tuple(vec![NodeJsonFactory.object(vec![
                ("x".to_string(), node("1")),
            ])]),
        );
    }

    #[test]
    fn query_returns_multiple_results() {
        let result = query_json(r#"[1, 2, 3]"#, ".[]").unwrap();
        assert_eq!(
            result,
            NodeJsonFactory.tuple(vec![node("1"), node("2"), node("3")]),
        );
    }

    // --- error path coverage ---

    #[test]
    fn query_fails_on_invalid_json_input() {
        assert!(query_json("{invalid}", ".").is_err());
    }

    #[test]
    fn query_runtime_error_propagates() {
        // 'error' built-in raises the input as a runtime error
        let err = query_json("{}", "error").unwrap_err();
        assert!(!err.to_string().is_empty());
    }

    #[test]
    fn query_fails_on_undefined_function() {
        // Calling an undefined 0-arity function triggers a compile error
        let err = query_json("{}", "undefined_custom_func_xyz").unwrap_err();
        assert!(err.to_string().contains("undefined"));
    }
}
