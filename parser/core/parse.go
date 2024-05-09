package core

import (
	"encoding/json"
)

func Parse(input string) (map[string]any, error) {
	data := ParsedData{}
	if err := json.Unmarshal([]byte(input), &data); err != nil {
		return map[string]any{}, err
	}

	return data, nil
}
