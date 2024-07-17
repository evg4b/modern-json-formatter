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
