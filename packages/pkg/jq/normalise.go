package jq

import (
	"math/big"
	"packages/pkg/tokens"
	"strconv"
)

func normalise(value any) any {
	switch value.(type) {
	case string:
		return tokens.StringNode(value.(string))
	case float64:
		return tokens.NumberNode(
			strconv.FormatFloat(value.(float64), 'f', -1, 64),
		)
	case bool:
		return tokens.BoolNode(value.(bool))
	case int:
		return tokens.NumberNode(strconv.Itoa(value.(int)))
	case nil:
		return tokens.NullNode()
	case *big.Int:
		return tokens.NumberNode(value.(*big.Int).String())
	case []any:
		items := value.([]any)
		mapped := make([]any, len(items))
		for i, item := range items {
			mapped[i] = normalise(item)
		}

		return tokens.ArrayNode(mapped)
	case map[string]any:
		properties := value.(map[string]any)
		mapped := make([]any, 0, len(properties))
		for key, value := range properties {
			mapped = append(mapped, tokens.PropertyNode(key, normalise(value)))
		}

		return tokens.ObjectNode(mapped)
	default:
		panic("unexpected type")
	}
}
