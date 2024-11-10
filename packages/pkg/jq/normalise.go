package jq

import (
	"math/big"
	"packages/pkg/core"
)

func normalise(value any) any {
	switch value.(type) {
	case string:
		return core.BuildStringNode(value.(string))
	case float64:
		return core.NumberNode(formatFloat(value))
	case bool:
		return core.BoolNode(value.(bool))
	case int:
		return core.NumberNode(formatInt(value))
	case nil:
		return core.NullNode()
	case *big.Int:
		return core.NumberNode(value.(*big.Int).String())
	case []any:
		return core.ArrayNode(arrayItems(value))
	case map[string]any:
		return core.ObjectNode(objectProperties(value))
	default:
		panic("unexpected type")
	}
}
