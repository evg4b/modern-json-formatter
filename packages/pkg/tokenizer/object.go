package tokenizer

import (
	"encoding/json"
	"packages/pkg/tokens"
)

func decodeObject(decoder *json.Decoder) (map[string]any, error) {
	properties := make([]any, 0)

	for decoder.More() {
		if key, err := decoder.Token(); err != nil {
			return nil, err
		} else {
			if value, err := tokenize(decoder); err != nil {
				return nil, err
			} else {
				properties = append(properties, tokens.PropertyNode(key.(string), value))
			}
		}
	}

	return tokens.ObjectNode(properties), nil
}
