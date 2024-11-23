package tokenizer_test

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"packages/pkg/tokenizer"
	"testing"
)

func TestFormat(t *testing.T) {
	cases := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "empty string",
			input:    `""`,
			expected: `""`,
		},
		{
			name:     "string with value",
			input:    `"value"`,
			expected: `"value"`,
		},
		{
			name:     "number value",
			input:    "123",
			expected: "123",
		},
		{
			name:     "object",
			input:    `{"key": "value"}`,
			expected: "{\n    \"key\": \"value\"\n}",
		},
		{
			name:     "array",
			input:    `["value"]`,
			expected: "[\n    \"value\"\n]",
		},
		{
			name:     "object with comments",
			input:    "{// comment\n\"key\": \"value\"}",
			expected: "{\n    \"key\": \"value\"\n}",
		},
	}

	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			formatted, err := tokenizer.Format(tt.input)

			require.NoError(t, err)
			assert.Equal(t, tt.expected, formatted)
		})
	}
}
