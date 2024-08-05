package jq

import (
	"math/big"
	"packages/pkg/tokens"
)

func normalise(value any) any {
	switch value.(type) {
	case string:
		return tokens.StringNode(value.(string))
	case float64:
		return tokens.NumberNode(formatFloat(value))
	case bool:
		return tokens.BoolNode(value.(bool))
	case int:
		return tokens.NumberNode(formatInt(value))
	case nil:
		return tokens.NullNode()
	case *big.Int:
		return tokens.NumberNode(value.(*big.Int).String())
	case []any:
		return tokens.ArrayNode(arrayItems(value))
	case map[string]any:
		return tokens.ObjectNode(objectProperties(value))
	default:
		panic("unexpected type")
	}
}
