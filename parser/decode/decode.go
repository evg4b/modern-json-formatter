package decode

import (
	"encoding/json"
	"errors"
	"io"
	"strings"
)

func Decode(input string) (map[string]any, error) {
	decoder := json.NewDecoder(strings.NewReader(input))
	decoder.UseNumber()

	return decode(decoder)

}

func decode(decoder *json.Decoder) (map[string]any, error) {
	token, err := decoder.Token()
	if err != nil {
		if err == io.EOF {
			return nil, io.EOF
		}
	}

	switch token.(type) {
	case json.Delim:
		switch token {
		case json.Delim('{'):
			return decodeObject(decoder)
		case json.Delim('['):
			return decodeArray(decoder)
		default:
			return nil, errors.New("invalid token")
		}

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
	default:
		return nil, errors.New("invalid token")
	}
}

func decodeArray(decoder *json.Decoder) (map[string]any, error) {
	items := make([]any, 0)

	for decoder.More() {
		item, err := decode(decoder)
		if err != nil {
			return nil, err
		}

		items = append(items, item)
	}

	token, err := decoder.Token()
	if err != nil {
		return nil, err
	}

	if token != json.Delim(']') {
		return nil, errors.New("invalid array")
	}

	return map[string]any{
		"type":  "array",
		"items": items,
	}, nil
}

func decodeObject(decoder *json.Decoder) (map[string]any, error) {
	properties := make([]any, 0)

	for decoder.More() {
		property := map[string]any{}
		key, err := decoder.Token()
		if err != nil {
			return nil, err
		}
		property["key"] = key.(string)
		property["value"], err = decode(decoder)

		properties = append(properties, property)
	}

	token, err := decoder.Token()
	if err != nil {
		return nil, err
	}

	if token != json.Delim('}') {
		return nil, errors.New("invalid object")
	}

	return map[string]any{
		"type":       "object",
		"properties": properties,
	}, nil
}
