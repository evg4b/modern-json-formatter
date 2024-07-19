package tokens

import "encoding/json"

func ObjectNode(properties []any) map[string]any {
	return map[string]any{
		"type":       "object",
		"properties": properties,
	}
}

func PropertyNode(key string, value any) map[string]any {
	return map[string]any{
		"key":   key,
		"value": value,
	}
}

func StringNode(token json.Token) map[string]any {
	return map[string]any{
		"type":  "string",
		"value": token,
	}
}

func NumberNode(token json.Token) map[string]any {
	number := token.(json.Number)
	return map[string]any{
		"type":  "number",
		"value": number.String(),
	}
}

func NullNode() map[string]any {
	return map[string]any{
		"type": "null",
	}
}

func BoolNode(token json.Token) map[string]any {
	return map[string]any{
		"type":  "bool",
		"value": token.(bool),
	}
}
func ErrorNode(token json.Token) map[string]any {
	return map[string]any{
		"type":  "bool",
		"value": token.(bool),
	}
}
