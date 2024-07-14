package tokenizer

import (
	"encoding/json"
	"errors"
)

func validateDelim(decoder *json.Decoder, delim rune) error {
	token, err := decoder.Token()
	if err != nil {
		return err
	}

	if token != json.Delim(delim) {
		return errors.New("invalid closing token")

	}

	return nil
}

func stringNode(token json.Token) map[string]any {
	return map[string]any{
		"type":  "string",
		"value": token,
	}
}

func numberNode(token json.Token) map[string]any {
	number := token.(json.Number)
	return map[string]any{
		"type":  "number",
		"value": number.String(),
	}
}

func nullNode() map[string]any {
	return map[string]any{
		"type": "null",
	}
}

func boolNode(token json.Token) map[string]any {
	return map[string]any{
		"type":  "bool",
		"value": token.(bool),
	}
}

func objectNode(properties []any) map[string]any {
	return map[string]any{
		"type":       "object",
		"properties": properties,
	}
}
