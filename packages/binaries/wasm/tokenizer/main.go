package main

import (
	"errors"
	"github.com/evg4b/modern-json-formatter/tokenizer/helpers"
	"github.com/evg4b/modern-json-formatter/tokenizer/pkg/tokenizer"
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
			return helpers.WrapError(errors.New("invalid arguments passed"))
		}

		if jsonTree, err := tokenize(args[0].String()); err != nil {
			return helpers.WrapError(err)
		} else {
			return js.ValueOf(jsonTree)
		}
	})
}
