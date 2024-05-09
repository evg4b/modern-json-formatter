package core

import (
	"encoding/json"
)

func Parse(input string) (map[string]any, error) {
	data := ParsedData{}
	if err := json.Unmarshal([]byte(input), &data); err != nil {
		return map[string]any{}, err
	}

	return castToMap(data), nil
}

func castToMap(pretty ParsedData) map[string]any {
	switch pretty["type"] {
	case "object":
		props := make(map[string]any, len(pretty["properties"].(map[string]ParsedData)))
		for key, value := range pretty["properties"].(map[string]ParsedData) {
			props[key] = castToMap(value)
		}

		return map[string]any{
			"type":       pretty["type"],
			"properties": props,
		}
	case "array":
		items := make([]any, len(pretty["items"].([]ParsedData)))
		for i, item := range pretty["items"].([]ParsedData) {
			items[i] = castToMap(item)
		}
		return map[string]any{
			"type":  pretty["type"],
			"items": items,
		}
	case "string":
		return map[string]any{
			"type":  pretty["type"],
			"value": pretty["value"],
		}
	case "number":
		return map[string]any{
			"type":  pretty["type"],
			"value": pretty["value"],
		}
	case "bool":
		return map[string]any{
			"type":  pretty["type"],
			"value": pretty["value"],
		}
	case "null":
		return map[string]any{
			"type": pretty["type"],
		}
	}

	panic("Not implemented: ")
}
