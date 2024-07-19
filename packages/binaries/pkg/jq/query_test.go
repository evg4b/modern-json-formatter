package jq_test

import (
	"binaries/pkg/jq"
	"binaries/pkg/tokens"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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
			name:     "number",
			json:     `{"key": 999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999.999999999999999999999999999999999999999999999999999999999999999999999999999}`,
			query:    ".key",
			expected: tokens.NumberNode("999"),
		},
		{
			name:     "null",
			json:     `{"key": null}`,
			query:    ".key",
			expected: tokens.NullNode(),
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
