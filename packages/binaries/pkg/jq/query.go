package jq

import (
	"binaries/pkg/tokens"
	"encoding/json"
	"strings"

	"github.com/itchyny/gojq"
)

func Query(jsonString string, queryString string) (any, error) {
	decoder := json.NewDecoder(strings.NewReader(jsonString))
	decoder.UseNumber()

	var data any
	if err := decoder.Decode(&data); err != nil {
		return nil, err
	}

	query, err := gojq.Parse(queryString)
	if err != nil {
		return nil, err
	}

	restsSet := make([]any, 0, 10)

	iter := query.Run(data)
	for {
		v, ok := iter.Next()
		if !ok {
			break
		}
		if err, ok := v.(error); ok {
			if err, ok := err.(*gojq.HaltError); ok && err.Value() == nil {
				break
			}

			return nil, err
		}

		restsSet = append(restsSet, normalise(v))
	}

	if len(restsSet) == 1 {
		return restsSet[0], nil
	}

	return tokens.ArrayNode(restsSet), nil
}
