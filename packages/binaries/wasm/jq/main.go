package main

import (
	"encoding/json"
	"errors"
	"github.com/evg4b/modern-json-formatter/tokenizer/helpers"
	"github.com/itchyny/gojq"
	"strings"
	"syscall/js"
)

func main() {
	window := js.Global()
	window.Set("jq", wrapper(func(input string, query string) (map[string]any, error) {
		return map[string]any{
			"input": input,
			"query": query,
		}, nil
	}))
	decoder := json.NewDecoder(strings.NewReader(`{"foo": [11231232132132132131231231233213213123123123321321312312312332132131231231233213213123123123123123123123123123123123123213123123123, 2, 3]}`))
	decoder.UseNumber()
	var v interface{}
	if err := decoder.Decode(&v); err != nil {
		panic(err)
	}

	query, err := gojq.Parse(".foo | ..")
	if err != nil {
		panic(err)
	}
	iter := query.Run(v)
	for {
		v, ok := iter.Next()
		if !ok {
			break
		}
		if err, ok := v.(error); ok {
			if err, ok := err.(*gojq.HaltError); ok && err.Value() == nil {
				break
			}
		}
	}
}

func wrapper(query func(input string, query string) (map[string]any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 2 {
			return helpers.WrapError(errors.New("invalid arguments passed"))
		}

		if jsonTree, err := query(args[0].String(), args[0].String()); err != nil {
			return helpers.WrapError(err)
		} else {
			return js.ValueOf(jsonTree)
		}
	})
}
