package core

func castToMap(data ParsedData) map[string]any {
	switch data["type"] {
	case "object":
		return castObject(data)
	case "array":
		return castArray(data)
	case "string":
		fallthrough
	case "number":
		fallthrough
	case "bool":
		return map[string]any{
			"type":  data["type"],
			"value": data["value"],
		}
	case "null":
		return map[string]any{
			"type": data["type"],
		}
	}

	panic("Unknown type")
}

func castArray(data ParsedData) map[string]any {
	items := make([]any, len(data["items"].([]ParsedData)))
	for i, item := range data["items"].([]ParsedData) {
		items[i] = castToMap(item)
	}
	return map[string]any{
		"type":  data["type"],
		"items": items,
	}
}

func castObject(data ParsedData) map[string]any {
	orderMap := data["properties"].(map[string]ParsedData)
	props := make([]any, len(orderMap))
	i := 0
	for key, value := range orderMap {
		props[i] = map[string]any{
			"key":   key,
			"value": castToMap(value),
		}
		i++
	}

	return map[string]any{
		"type":       data["type"],
		"properties": props,
	}
}
