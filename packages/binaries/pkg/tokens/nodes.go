package tokens

import "encoding/json"

func ArrayNode(elements ...any) map[string]any {
	return map[string]any{
		"type":     "array",
		"elements": elements,
	}
}

func ObjectNode(properties ...any) map[string]any {
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

func StringToken(token json.Token) map[string]any {
	return StringNode(token.(string))
}

func StringNode(token string) map[string]any {
	return map[string]any{
		"type":  "string",
		"value": token,
	}
}

func NumberToken(token json.Token) map[string]any {
	number := token.(json.Number)
	return NumberNode(number.String())
}

func NumberNode(token string) map[string]any {
	return map[string]any{
		"type":  "number",
		"value": token,
	}
}

func NullNode() map[string]any {
	return map[string]any{
		"type": "null",
	}
}

func BoolToken(token json.Token) map[string]any {
	return BoolNode(token.(bool))
}

func BoolNode(token bool) map[string]any {
	return map[string]any{
		"type":  "bool",
		"value": token,
	}
}

func ErrorNode(token json.Token) map[string]any {
	return map[string]any{
		"type":  "bool",
		"value": token.(bool),
	}
}