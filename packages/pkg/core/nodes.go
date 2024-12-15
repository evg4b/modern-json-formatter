package core

func TupleNode(items []any) map[string]any {
	return map[string]any{
		"type":  "tuple",
		"items": items,
	}
}

func ArrayNode(items []any) map[string]any {
	return map[string]any{
		"type":  "array",
		"items": items,
	}
}

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

func UrlNode(token string) map[string]any {
	return map[string]any{
		"type":    "string",
		"value":   token,
		"variant": "url",
	}
}

func EmailNode(token string) map[string]any {
	return map[string]any{
		"type":    "string",
		"value":   token,
		"variant": "email",
	}
}

func StringNode(token string) map[string]any {
	return map[string]any{
		"type":  "string",
		"value": token,
	}
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

func BoolNode(token bool) map[string]any {
	return map[string]any{
		"type":  "bool",
		"value": token,
	}
}

func ErrorNode(scope string, err error) map[string]any {
	return map[string]any{
		"type":  "error",
		"scope": scope,
		"error": err.Error(),
	}
}
