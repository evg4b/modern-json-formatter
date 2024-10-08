package tokenizer

import (
	"encoding/json"
	"packages/pkg/tokens"
)

func decodeArray(decoder *json.Decoder) (map[string]any, error) {
	items := make([]any, 0, 25)

	for decoder.More() {
		item, err := tokenize(decoder)
		if err != nil {
			return nil, err
		}

		items = append(items, item)
	}

	return tokens.ArrayNode(items), nil
}
