package main

import (
	"binaries/helpers"
	"binaries/pkg/tokens"
	"errors"
	"syscall/js"
)

func main() {
	window := js.Global()
	window.Set("___jq", wrapper(func(input string, query string) (map[string]any, error) {
		return tokens.ObjectNode([]any{
			tokens.PropertyNode("input", tokens.StringNode(input)),
			tokens.PropertyNode("query", tokens.StringNode(query)),
		}), nil
	}))
	<-make(chan struct{})
}

func wrapper(query func(input string, query string) (map[string]any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 2 {
			return helpers.WrapError(errors.New("invalid arguments passed"))
		}

		if jsonTree, err := query(args[0].String(), args[1].String()); err != nil {
			return helpers.WrapError(err)
		} else {
			return js.ValueOf(jsonTree)
		}
	})
}
