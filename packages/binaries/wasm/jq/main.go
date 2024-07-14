package main

import (
	"errors"
	"github.com/evg4b/modern-json-formatter/tokenizer/helpers"
	"syscall/js"
)

func main() {
	window := js.Global()
	window.Set("jq", wrapper(func(input string, query string) (map[string]any, error) {
		return map[string]any{"input": input, "query": query}, nil
	}))
	<-make(chan struct{})
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
