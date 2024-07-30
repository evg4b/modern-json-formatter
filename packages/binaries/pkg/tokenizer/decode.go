package tokenizer

import (
	"binaries/pkg/tokens"
	"encoding/json"
	"errors"
	"io"
	"strings"
)

func Tokenize(input string) (map[string]any, error) {
	decoder := json.NewDecoder(strings.NewReader(input))
	decoder.UseNumber()

	return tokenize(decoder)
}

func tokenize(decoder *json.Decoder) (map[string]any, error) {
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
			if object, err := decodeObject(decoder); err != nil {
				return nil, err
			} else {
				if err = validateDelim(decoder, '}'); err != nil {
					return nil, err
				}

				return object, nil
			}

		case json.Delim('['):
			if array, err := decodeArray(decoder); err != nil {
				return nil, err
			} else {
				if err = validateDelim(decoder, ']'); err != nil {
					return nil, err
				}

				return array, nil
			}

		default:
			return nil, errors.New("invalid token")
		}

	case string:
		return tokens.StringToken(token), nil
	case json.Number:
		return tokens.NumberNode(token.(json.Number).String()), nil
	case nil:
		return tokens.NullNode(), nil
	case bool:
		return tokens.BoolNode(token.(bool)), nil
	default:
		return nil, errors.New("unknown token")
	}
}
