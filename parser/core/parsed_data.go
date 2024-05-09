package core

import (
	"bytes"
	"encoding/json"
)

type ParsedData map[string]any

func (a *ParsedData) UnmarshalJSON(b []byte) error {
	decoder := json.NewDecoder(bytes.NewReader(b))
	decoder.UseNumber()

	if *a == nil {
		*a = ParsedData{}
	}

	obj := map[string]ParsedData{}
	if err := json.Unmarshal(b, &obj); err == nil {
		if obj == nil {
			(*a)["type"] = "null"
		} else {
			(*a)["type"] = "object"
			(*a)["properties"] = obj
		}

		return nil
	}

	arr := []ParsedData{}
	if err := json.Unmarshal(b, &arr); err == nil {
		(*a)["type"] = "array"
		(*a)["items"] = arr
		return nil
	}

	str := ""
	if err := json.Unmarshal(b, &str); err == nil {
		(*a)["type"] = "string"
		(*a)["value"] = str
		return nil
	}

	number := json.Number("")
	if err := json.Unmarshal(b, &number); err == nil {
		(*a)["type"] = "number"
		(*a)["value"] = string(number)
		return nil
	}

	return nil
}
