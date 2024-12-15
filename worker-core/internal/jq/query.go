package jq

import (
	"bytes"
	"encoding/json"
	"errors"
	"worker-core/internal/core"

	"github.com/itchyny/gojq"
	"github.com/marcozac/go-jsonc"
)

func Query(jsonString string, queryString string) (any, error) {
	sanitizedData, err := jsonc.Sanitize([]byte(jsonString))
	if err != nil {
		return nil, err
	}

	decoder := json.NewDecoder(bytes.NewReader(sanitizedData))
	decoder.UseNumber()

	var data any
	if err := decoder.Decode(&data); err != nil {
		return nil, err
	}

	query, err := gojq.Parse(queryString)
	if err != nil {
		return nil, err
	}

	results := make([]any, 0, 10)

	iterator := query.Run(data)
	for {
		v, ok := iterator.Next()
		if !ok {
			break
		}
		if err, ok := v.(error); ok {
			var haltError *gojq.HaltError
			if errors.As(err, &haltError) && haltError.Value() == nil {
				break
			}

			return nil, err
		}

		results = append(results, normalise(v))
	}

	if len(results) == 1 {
		return results[0], nil
	}

	return core.TupleNode(results), nil
}
