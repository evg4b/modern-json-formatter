package tokenizer

import (
	"encoding/json"
	"packages/pkg/tokens"
	"strings"
)

const cutset = " \t\n\r"

const httpPrefix = "http://"
const httpsPrefix = "https://"
const relativeUrlPrefix = "/"

func hasUrlPrefix(value string) bool {
	return strings.HasPrefix(value, httpPrefix) ||
		strings.HasPrefix(value, httpsPrefix) ||
		strings.HasPrefix(value, relativeUrlPrefix)
}

func decodeString(token json.Token) (map[string]any, error) {
	original := token.(string)
	if hasUrlPrefix(strings.Trim(original, cutset)) {
		return tokens.UrlNode(original), nil
	}

	return tokens.StringNode(original), nil
}
