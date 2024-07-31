package main

import (
	"errors"
	"packages/pkg/tokenizer"
	"packages/pkg/tokens"
	"syscall/js"
)

func main() {
	window := js.Global()
	window.Set("___tokenizeJSON", wrapper(tokenizer.Tokenize))
	<-make(chan struct{})
}

func wrapper(tokenize func(input string) (map[string]any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 1 {
			return js.ValueOf(tokens.ErrorNode(
				"tokenizer",
				errors.New("invalid arguments passed"),
			))
		}

		if jsonTree, err := tokenize(args[0].String()); err != nil {
			return js.ValueOf(tokens.ErrorNode(
				"tokenizer",
				err,
			))
		} else {
			return js.ValueOf(jsonTree)
		}
	})
}
