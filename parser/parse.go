package main

import (
	"encoding/json"
	"strings"
)

type ParsedData = map[string]any

func Parse(input string) (map[string]any, error) {
	decoder := json.NewDecoder(strings.NewReader(input))
	decoder.UseNumber()
	data := ParsedData{}
	if err := decoder.Decode(&data); err != nil {
		return map[string]any{}, err
	}

	return data, nil
}
