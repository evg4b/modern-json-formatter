package jq_test

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"packages/pkg/jq"
	"packages/pkg/tokens"
	"testing"
)

func TestQuery(t *testing.T) {
	cases := []struct {
		name     string
		json     string
		query    string
		expected any
	}{
		{
			name:     "string",
			json:     `{"key": "value"}`,
			query:    ".key",
			expected: tokens.StringNode("value"),
		},
		{
			name:     "int number",
			json:     `{"key": 1}`,
			query:    ".key",
			expected: tokens.NumberNode("1"),
		},
		{
			name:     "float number",
			json:     `{"key": 456.456}`,
			query:    ".key",
			expected: tokens.NumberNode("456.456"),
		},
		{
			name:     "null",
			json:     `{"key": null}`,
			query:    ".key",
			expected: tokens.NullNode(),
		},
		{
			name:     "bool",
			json:     `{"key": true}`,
			query:    ".key",
			expected: tokens.BoolNode(true),
		},
		{
			name:     "uint64",
			json:     `{ "key": 18446744073709551616 }`,
			query:    ".key",
			expected: tokens.NumberNode("18446744073709551616"),
		},
		{
			name:     "big int",
			json:     `{ "key": 18446744073709551333616 }`,
			query:    ".key",
			expected: tokens.NumberNode("18446744073709551333616"),
		},
		{
			name:  "array",
			json:  `{"key": [1, 2, 3]}`,
			query: ".key",
			expected: tokens.ArrayNode([]any{
				tokens.NumberNode("1"),
				tokens.NumberNode("2"),
				tokens.NumberNode("3"),
			}),
		},
		{
			name:  "object",
			json:  `{"key": {"subkey": "value"}}`,
			query: ".key",
			expected: tokens.ObjectNode([]any{
				tokens.PropertyNode("subkey", tokens.StringNode("value")),
			}),
		},
		{
			name:  "nested object",
			json:  `{"key": {"subkey": {"subsubkey": "value"}}}`,
			query: ".key",
			expected: tokens.ObjectNode([]any{
				tokens.PropertyNode("subkey",
					tokens.ObjectNode([]any{
						tokens.PropertyNode("subsubkey", tokens.StringNode("value")),
					}),
				),
			}),
		},
		{
			name:  "nested array",
			json:  `[[[1, 2, 3]]]`,
			query: ".[0][0]",
			expected: tokens.ArrayNode([]any{
				tokens.NumberNode("1"),
				tokens.NumberNode("2"),
				tokens.NumberNode("3"),
			}),
		},
		{
			name:  "tuple",
			json:  `[1, 2, 3]`,
			query: ".[]",
			expected: tokens.TupleNode([]any{
				tokens.NumberNode("1"),
				tokens.NumberNode("2"),
				tokens.NumberNode("3"),
			}),
		},
		{
			name:  "tuple with object",
			json:  `[{"key": "value"}, {"key2": "value2"}]`,
			query: ".[]",
			expected: tokens.TupleNode([]any{
				tokens.ObjectNode([]any{
					tokens.PropertyNode("key", tokens.StringNode("value")),
				}),
				tokens.ObjectNode([]any{
					tokens.PropertyNode("key2", tokens.StringNode("value2")),
				}),
			}),
		},
		{
			name:  "tuple with array",
			json:  `[[1, 2], [3, 4]]`,
			query: ".[]",
			expected: tokens.TupleNode([]any{
				tokens.ArrayNode([]any{
					tokens.NumberNode("1"),
					tokens.NumberNode("2"),
				}),
				tokens.ArrayNode([]any{
					tokens.NumberNode("3"),
					tokens.NumberNode("4"),
				}),
			}),
		},
	}
	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			result, err := jq.Query(testCase.json, testCase.query)
			require.NoError(t, err)
			assert.Equal(t, testCase.expected, result)
		})
	}
}
