package main

import (
	"errors"
	"packages/pkg/jq"
	"packages/pkg/tokens"
	"syscall/js"
)

func main() {
	window := js.Global()
	window.Set("___jq", wrapper(jq.Query))
	<-make(chan struct{})
}

func wrapper(query func(input string, query string) (any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 2 {
			return js.ValueOf(tokens.ErrorNode(
				"jq",
				errors.New("invalid arguments passed"),
			))
		}

		if jsonTree, err := query(args[0].String(), args[1].String()); err != nil {
			return js.ValueOf(tokens.ErrorNode(
				"jq",
				err,
			))
		} else {
			return js.ValueOf(jsonTree)
		}
	})
}
