package jq_test

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"packages/pkg/core"
	"packages/pkg/jq"
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
			expected: core.StringNode("value"),
		},
		{
			name:     "int number",
			json:     `{"key": 1}`,
			query:    ".key",
			expected: core.NumberNode("1"),
		},
		{
			name:     "float number",
			json:     `{"key": 456.456}`,
			query:    ".key",
			expected: core.NumberNode("456.456"),
		},
		{
			name:     "null",
			json:     `{"key": null}`,
			query:    ".key",
			expected: core.NullNode(),
		},
		{
			name:     "bool",
			json:     `{"key": true}`,
			query:    ".key",
			expected: core.BoolNode(true),
		},
		{
			name:     "uint64",
			json:     `{ "key": 18446744073709551616 }`,
			query:    ".key",
			expected: core.NumberNode("18446744073709551616"),
		},
		{
			name:     "big int",
			json:     `{ "key": 18446744073709551333616 }`,
			query:    ".key",
			expected: core.NumberNode("18446744073709551333616"),
		},
		{
			name:  "array",
			json:  `{"key": [1, 2, 3]}`,
			query: ".key",
			expected: core.ArrayNode([]any{
				core.NumberNode("1"),
				core.NumberNode("2"),
				core.NumberNode("3"),
			}),
		},
		{
			name:  "object",
			json:  `{"key": {"subkey": "value"}}`,
			query: ".key",
			expected: core.ObjectNode([]any{
				core.PropertyNode("subkey", core.StringNode("value")),
			}),
		},
		{
			name:  "nested object",
			json:  `{"key": {"subkey": {"subsubkey": "value"}}}`,
			query: ".key",
			expected: core.ObjectNode([]any{
				core.PropertyNode("subkey",
					core.ObjectNode([]any{
						core.PropertyNode("subsubkey", core.StringNode("value")),
					}),
				),
			}),
		},
		{
			name:  "nested array",
			json:  `[[[1, 2, 3]]]`,
			query: ".[0][0]",
			expected: core.ArrayNode([]any{
				core.NumberNode("1"),
				core.NumberNode("2"),
				core.NumberNode("3"),
			}),
		},
		{
			name:  "tuple",
			json:  `[1, 2, 3]`,
			query: ".[]",
			expected: core.TupleNode([]any{
				core.NumberNode("1"),
				core.NumberNode("2"),
				core.NumberNode("3"),
			}),
		},
		{
			name:  "tuple with object",
			json:  `[{"key": "value"}, {"key2": "value2"}]`,
			query: ".[]",
			expected: core.TupleNode([]any{
				core.ObjectNode([]any{
					core.PropertyNode("key", core.StringNode("value")),
				}),
				core.ObjectNode([]any{
					core.PropertyNode("key2", core.StringNode("value2")),
				}),
			}),
		},
		{
			name:  "tuple with array",
			json:  `[[1, 2], [3, 4]]`,
			query: ".[]",
			expected: core.TupleNode([]any{
				core.ArrayNode([]any{
					core.NumberNode("1"),
					core.NumberNode("2"),
				}),
				core.ArrayNode([]any{
					core.NumberNode("3"),
					core.NumberNode("4"),
				}),
			}),
		},
		{
			name: "json with comments",
			json: `{
				"key": "value", // comment
				"key2": "value2" // comment
			}`,
			query:    ".key",
			expected: core.StringNode("value"),
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
