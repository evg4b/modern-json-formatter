package core_test

import (
	"github.com/evg4b/modern-json-formatter/parser/core"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
)

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

func tString(value string) core.ParsedData {
	return core.ParsedData{
		"type":  "string",
		"value": value,
	}
}

func tNumber(value string) core.ParsedData {
	return core.ParsedData{
		"type":  "number",
		"value": value,
	}
}

func tNull() core.ParsedData {
	return core.ParsedData{
		"type": "null",
	}
}

func tArray(items ...core.ParsedData) core.ParsedData {
	if items == nil {
		items = []core.ParsedData{}
	}

	return core.ParsedData{
		"type":  "array",
		"items": items,
	}
}

func tObject(properties map[string]core.ParsedData) core.ParsedData {
	if properties == nil {
		properties = map[string]core.ParsedData{}
	}

	return core.ParsedData{
		"type":       "object",
		"properties": properties,
	}
}

func TestParse(t *testing.T) {
	t.Run("object parsing", func(t *testing.T) {
		runTestCases(t, []testCases{
			{
				name:  "empty object",
				input: "{}",
				want:  tObject(map[string]core.ParsedData{}),
			},
			{
				name:  "object with string",
				input: `{"key": "value"}`,
				want: tObject(map[string]core.ParsedData{
					"key": tString("value"),
				}),
			},
			{
				name:  "object with number",
				input: `{"key": 1234}`,
				want: tObject(map[string]core.ParsedData{
					"key": tNumber("1234"),
				}),
			},
			{
				name:  "object with object",
				input: `{"key": {"key2": "value2"}}`,
				want: tObject(map[string]core.ParsedData{
					"key": tObject(map[string]core.ParsedData{
						"key2": tString("value2"),
					}),
				}),
			},
			{
				name:  "object with array",
				input: `{"key": ["value", "value2"]}`,
				want: tObject(map[string]core.ParsedData{
					"key": tArray(
						tString("value"),
						tString("value2"),
					),
				}),
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
					tObject(map[string]core.ParsedData{
						"key": tString("value"),
					}),
					tObject(map[string]core.ParsedData{
						"key2": tString("value2"),
					}),
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
					tObject(map[string]core.ParsedData{
						"key": tString("value"),
					}),
					tNull(),
					tArray(
						tArray(
							tObject(map[string]core.ParsedData{}),
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
}
