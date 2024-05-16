package core

import (
	"encoding/json"
	"io"
	"strings"
)

func Decode(input string) (map[string]any, error) {
	decoder := json.NewDecoder(strings.NewReader(input))
	decoder.UseNumber()

	token, err := decoder.Token()
	if err != nil {
		if err == io.EOF {
			panic("EOF")
		}
	}

	switch token.(type) {
	case string:
		return map[string]any{
			"type":  "string",
			"value": token,
		}, nil
	case json.Number:
		number := token.(json.Number)
		return map[string]any{
			"type":  "number",
			"value": number.String(),
		}, nil
	case nil:
		return map[string]any{
			"type": "null",
		}, nil
	case bool:
		return map[string]any{
			"type":  "bool",
			"value": token.(bool),
		}, nil
	}

	return nil, nil
}
