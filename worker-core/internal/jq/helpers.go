package jq

import (
	"strconv"
	"worker-core/internal/core"
)

func formatFloat(value any) string {
	return strconv.FormatFloat(value.(float64), 'f', -1, 64)
}

func formatInt(value any) string {
	return strconv.Itoa(value.(int))
}

func arrayItems(value any) []any {
	items := value.([]any)
	mapped := make([]any, len(items))
	for i, item := range items {
		mapped[i] = normalise(item)
	}

	return mapped
}

func objectProperties(value any) []any {
	properties := value.(map[string]any)
	mapped := make([]any, 0, len(properties))
	for key, value := range properties {
		mapped = append(mapped, core.PropertyNode(key, normalise(value)))
	}

	return mapped
}
