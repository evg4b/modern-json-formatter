package jq

import (
	"binaries/pkg/tokens"
	"encoding/json"
	"io"
	"log"
	"math/big"
	"strconv"
	"strings"

	"github.com/itchyny/gojq"
)

func Query(jsonString string, queryString string) (any, error) {
	decoder := json.NewDecoder(strings.NewReader(jsonString))
	decoder.UseNumber()

	var data any
	if err := decoder.Decode(&data); err != nil {
		return nil, err
	}

	query, err := gojq.Parse(queryString)
	if err != nil {
		return nil, err
	}

	iter := query.Run(data)
	for {
		v, ok := iter.Next()
		if !ok {
			break
		}
		if err, ok := v.(error); ok {
			if err, ok := err.(*gojq.HaltError); ok && err.Value() == nil {
				break
			}
			log.Fatalln(err)
		}

		return transform(v), nil
	}

	return nil, io.EOF
}

func transform(v any) any {
	switch v.(type) {
	case string:
		return tokens.StringNode(v.(string))
	case float64:
		return tokens.NumberNode(
			strconv.FormatFloat(v.(float64), 'f', -1, 64),
		)
	case bool:
		return tokens.BoolNode(v.(bool))
	case int:
		return tokens.NumberNode(strconv.Itoa(v.(int)))
	case nil:
		return tokens.NullNode()
	case *big.Int:
		return tokens.NumberNode(v.(*big.Int).String())
	case []any:
		items := v.([]any)
		mapped := make([]any, len(items))
		for i, item := range items {
			mapped[i] = transform(item)
		}

		return tokens.ArrayNode(mapped...)
	case map[string]any:
		properties := v.(map[string]any)
		mapped := make([]any, 0, len(properties))
		for key, value := range properties {
			mapped = append(mapped, tokens.PropertyNode(key, transform(value)))
		}

		return tokens.ObjectNode(mapped...)
	default:
		panic("unexpected type")
	}
}
