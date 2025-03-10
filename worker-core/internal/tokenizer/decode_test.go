package tokenizer_test

import (
	"fmt"
	"io"
	"testing"
	"worker-core/internal/tokenizer"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTokenizer(t *testing.T) {
	t.Run("strings parsing", func(t *testing.T) {
		runTestCasesTokenizer(t, []testCases{
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

		t.Run("url detecting", func(t *testing.T) {
			var variants = []struct {
				name string
				url  string
			}{
				{
					name: "string with http url",
					url:  "http://test.com",
				},
				{
					name: "string with https url",
					url:  "https://test.com",
				},
				{
					name: "string with ftp url",
					url:  "ftp://test.com",
				},
				{
					name: "string with relative url",
					url:  "/path/to/resource",
				},
			}

			for _, variant := range variants {
				t.Run(variant.name, func(t *testing.T) {
					runTestCasesTokenizer(t, []testCases{
						{
							name:     "token directly",
							input:    fmt.Sprintf(`"%s"`, variant.url),
							expected: tUrl(variant.url),
						},
						{
							name:     "with empty symbols",
							input:    fmt.Sprintf(`" \t\n\r%s \t\n\r"`, variant.url),
							expected: tUrl(fmt.Sprintf(" \t\n\r%s \t\n\r", variant.url)),
						},
					})
				})
			}
		})

		t.Run("email detecting", func(t *testing.T) {
			runTestCasesTokenizer(t, []testCases{
				{
					name:     "emal directly",
					input:    `"test_user@mail.com"`,
					expected: tEmail("test_user@mail.com"),
				},
				{
					name:     "email with empty symbols",
					input:    `" \t\n\rtest_user@mail.com \t\n\r"`,
					expected: tEmail(" \t\n\rtest_user@mail.com \t\n\r"),
				},
			})
		})
	})

	t.Run("numbers parsing", func(t *testing.T) {
		runTestCasesTokenizer(t, []testCases{
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
		runTestCasesTokenizer(t, []testCases{
			{
				name:     "null",
				input:    "null",
				expected: tNull(),
			},
		})
	})

	t.Run("boolean parsing", func(t *testing.T) {
		runTestCasesTokenizer(t, []testCases{
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

	t.Run("object parsing", func(t *testing.T) {
		runTestCasesTokenizer(t, []testCases{
			{
				name:     "empty object",
				input:    "{}",
				expected: tObject(),
			},
			{
				name:  "object with string",
				input: `{"key": "value"}`,
				expected: tObject(
					tProperty("key", tString("value")),
				),
			},
			{
				name:  "object with number",
				input: `{ "key": 1234 }`,
				expected: tObject(
					tProperty("key", tNumber("1234")),
				),
			},
			{
				name:  "object with object",
				input: `{"key": {"key2": "value2"}}`,
				expected: tObject(
					tProperty("key", tObject(
						tProperty("key2", tString("value2")),
					)),
				),
			},
		})
	})

	t.Run("array parsing", func(t *testing.T) {
		runTestCasesTokenizer(t, []testCases{
			{
				name:     "empty array",
				input:    "[]",
				expected: tArray(),
			},
			{
				name:  "array with string",
				input: `["value", "value2", "value3"]`,
				expected: tArray(
					tString("value"),
					tString("value2"),
					tString("value3"),
				),
			},
			{
				name:  "array with number",
				input: `[1, 2, 3]`,
				expected: tArray(
					tNumber("1"),
					tNumber("2"),
					tNumber("3"),
				),
			},
			{
				name:  "array with object",
				input: `[{"key": "value"}, {"key2": "value2"}]`,
				expected: tArray(
					tObject(
						tProperty("key", tString("value")),
					),
					tObject(
						tProperty("key2", tString("value2")),
					),
				),
			},
			{
				name:  "array with array",
				input: `[[1, 2], [3, 4]]`,
				expected: tArray(
					tArray(
						tNumber("1"),
						tNumber("2"),
					),
					tArray(
						tNumber("3"),
						tNumber("4"),
					),
				),
			},
			{
				name:  "array with mixed types",
				input: `["value", 1, {"key": "value"}, null, [[{}]]]`,
				expected: tArray(
					tString("value"),
					tNumber("1"),
					tObject(
						tProperty("key", tString("value")),
					),
					tNull(),
					tArray(
						tArray(
							tObject(),
						),
					),
				),
			},
		})
	})

	t.Run("ignore comments", func(t *testing.T) {
		actual, err := tokenizer.Tokenize(`{
			"key": "value" // comment
		}`)
		require.NoError(t, err)

		assert.Equal(t, tObject(
			tProperty("key", tString("value")),
		), actual)
	})

	t.Run("return error for", func(t *testing.T) {
		t.Run("empty input", func(t *testing.T) {
			got, err := tokenizer.Tokenize("")

			assert.Nil(t, got)
			assert.Equal(t, io.EOF, err)
		})
	})
}

type testCases struct {
	name     string
	input    string
	expected map[string]any
}

func runTestCasesTokenizer(t *testing.T, tests []testCases) {
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tokenizer.Tokenize(tt.input)
			require.NoError(t, err)

			assert.Equal(t, tt.expected, got)
		})
	}
}

func tString(value string) map[string]any {
	return map[string]any{
		"type":  "string",
		"value": value,
	}
}

func tUrl(value string) map[string]any {
	return map[string]any{
		"type":    "string",
		"value":   value,
		"variant": "url",
	}
}

func tEmail(value string) map[string]any {
	return map[string]any{
		"type":    "string",
		"value":   value,
		"variant": "email",
	}
}

func tNumber(value string) map[string]any {
	return map[string]any{
		"type":  "number",
		"value": value,
	}
}

func tBoolean(value bool) map[string]any {
	return map[string]any{
		"type":  "bool",
		"value": value,
	}
}

func tNull() map[string]any {
	return map[string]any{
		"type": "null",
	}
}

func tArray(items ...any) map[string]any {
	if items == nil {
		items = []any{}
	}

	return map[string]any{
		"type":  "array",
		"items": items,
	}
}

func tObject(properties ...any) map[string]any {
	if properties == nil {
		properties = []any{}
	}

	return map[string]any{
		"type":       "object",
		"properties": properties,
	}
}

func tProperty(key string, value any) map[string]any {
	return map[string]any{
		"key":   key,
		"value": value,
	}
}
