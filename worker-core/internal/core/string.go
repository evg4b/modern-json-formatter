package core

import (
	"net/mail"
	"strings"
)

const cutset = " \t\n\r"

const httpPrefix = "http://"
const httpsPrefix = "https://"
const ftpPrefix = "ftp://"
const relativeUrlPrefix = "/"

func isEmail(value string) bool {
	_, err := mail.ParseAddress(value)
	return err == nil
}

func hasUrlPrefix(value string) bool {
	return strings.HasPrefix(value, httpPrefix) ||
		strings.HasPrefix(value, httpsPrefix) ||
		strings.HasPrefix(value, ftpPrefix) ||
		strings.HasPrefix(value, relativeUrlPrefix)
}

func BuildStringNode(value string) map[string]any {
	trimmed := strings.Trim(value, cutset)

	if hasUrlPrefix(trimmed) {
		return UrlNode(value)
	}

	if isEmail(trimmed) {
		return EmailNode(value)
	}

	return StringNode(value)
}
