package tokenizer

import (
	"bytes"
	"encoding/json"
	"github.com/marcozac/go-jsonc"
)

func Format(input string) (string, error) {
	sanitizedData, err := jsonc.Sanitize([]byte(input))
	if err != nil {
		return "", err
	}

	var out bytes.Buffer
	err = json.Indent(&out, sanitizedData, "", "    ")

	return string(out.Bytes()), err
}
