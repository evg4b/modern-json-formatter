package core_test

import (
	"github.com/evg4b/modern-json-formatter/parser/core"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestParse(t *testing.T) {
	t.Run("object parsing", func(t *testing.T) {
		runTestCases(t, []testCases{
			{
				name:  "empty object",
				input: "{}",
				want:  tObject(),
			},
			{
				name:  "object with string",
				input: `{"key": "value"}`,
				want: tObject(
					tProperty("key", tString("value")),
				),
			},
			{
				name:  "object with number",
				input: `{"key": 1234}`,
				want: tObject(
					tProperty("key", tNumber("1234")),
				),
			},
			{
				name:  "object with object",
				input: `{"key": {"key2": "value2"}}`,
				want: tObject(
					tProperty("key", tObject(
						tProperty("key2", tString("value2")),
					)),
				),
			},
			{
				name:  "object with array",
				input: `{"key": ["value", "value2"]}`,
				want: tObject(
					tProperty("key", tArray(
						tString("value"),
						tString("value2"),
					)),
				),
			},
		})
	})

	t.Run("array parsing", func(t *testing.T) {
		runTestCases(t, []testCases{
			{
				name:  "empty array",
				input: "[]",
				want:  tArray(),
			},
			{
				name:  "array with string",
				input: `["value", "value2", "value3"]`,
				want: tArray(
					tString("value"),
					tString("value2"),
					tString("value3"),
				),
			},
			{
				name:  "array with number",
				input: `[1, 2, 3]`,
				want: tArray(
					tNumber("1"),
					tNumber("2"),
					tNumber("3"),
				),
			},
			{
				name:  "array with object",
				input: `[{"key": "value"}, {"key2": "value2"}]`,
				want: tArray(
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
				want: tArray(
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
				want: tArray(
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

	t.Run("number parsing", func(t *testing.T) {
		runTestCases(t, []testCases{
			{
				name:  "number",
				input: "1",
				want:  tNumber("1"),
			},
			{
				name:  "float number",
				input: "1.1",
				want:  tNumber("1.1"),
			},
			{
				name:  "negative number",
				input: "-1",
				want:  tNumber("-1"),
			},
		})
	})

	t.Run("null parsing", func(t *testing.T) {
		runTestCases(t, []testCases{
			{
				name:  "null",
				input: "null",
				want:  tNull(),
			},
		})
	})

	t.Run("boolean parsing", func(t *testing.T) {
		runTestCases(t, []testCases{
			{
				name:  "true",
				input: "true",
				want:  tBoolean(true),
			},
			{
				name:  "false",
				input: "false",
				want:  tBoolean(false),
			},
		})
	})
}

type testCases struct {
	name  string
	input string
	want  map[string]any
}

func runTestCases(t *testing.T, tests []testCases) {
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := core.Parse(tt.input)
			require.NoError(t, err)

			assert.Equal(t, tt.want, got)
		})
	}
}

func tString(value string) map[string]any {
	return map[string]any{
		"type":  "string",
		"value": value,
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
