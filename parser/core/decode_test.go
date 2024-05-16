package core_test

import (
	"github.com/evg4b/modern-json-formatter/parser/core"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestDecode(t *testing.T) {
	t.Run("strings parsing", func(t *testing.T) {
		runTestCasesDecode(t, []testCases{
			{
				name:     "empty string",
				input:    `""'`,
				expected: tString(""),
			},
			{
				name:     "string with value",
				input:    `"value"`,
				expected: tString("value"),
			},
		})
	})

	t.Run("numbers parsing", func(t *testing.T) {
		runTestCasesDecode(t, []testCases{
			{
				name:     "number",
				input:    "1",
				expected: tNumber("1"),
			},
			{
				name:     "float number",
				input:    "1.1",
				expected: tNumber("1.1"),
			},
			{
				name:     "negative number",
				input:    "-1",
				expected: tNumber("-1"),
			},
		})
	})

	t.Run("null parsing", func(t *testing.T) {
		runTestCasesDecode(t, []testCases{
			{
				name:     "null",
				input:    "null",
				expected: tNull(),
			},
		})
	})

	t.Run("boolean parsing", func(t *testing.T) {
		runTestCasesDecode(t, []testCases{
			{
				name:     "true",
				input:    "true",
				expected: tBoolean(true),
			},
			{
				name:     "false",
				input:    "false",
				expected: tBoolean(false),
			},
		})
	})
}

type testCases struct {
	name     string
	input    string
	expected map[string]any
}

func runTestCasesDecode(t *testing.T, tests []testCases) {
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := core.Decode(tt.input)
			require.NoError(t, err)

			assert.Equal(t, tt.expected, got)
		})
	}
}
