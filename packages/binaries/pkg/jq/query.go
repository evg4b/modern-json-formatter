package jq

import (
	"binaries/pkg/tokens"
	"encoding/json"
	"io"
	"log"
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
			log.Fatalln(err)
		}

		return tranfrorm(v), nil
	}

	return nil, io.EOF
}

func tranfrorm(v any) any {
	switch v.(type) {
	case string:
		return tokens.StringNode(v.(string))
	default:
		return v
	}
}
