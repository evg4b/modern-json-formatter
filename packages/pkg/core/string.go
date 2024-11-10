package core

import (
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

func BuildStringNode(value string) map[string]any {
	if hasUrlPrefix(strings.Trim(value, cutset)) {
		return UrlNode(value)
	}

	return StringNode(value)
}
