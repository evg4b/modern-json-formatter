package main

import (
	"errors"
	"github.com/evg4b/modern-json-formatter/tokenizer/tokenizer"
	"syscall/js"
)

func main() {
	window := js.Global()
	window.Set("tokenizerJSON", wrapper(tokenizer.Tokenize))
	<-make(chan struct{})
}

func wrapError(err error) js.Value {
	return js.ValueOf(map[string]any{
		"type":  "error",
		"error": err.Error(),
	})
}

func wrapper(tokenize func(input string) (map[string]any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 1 {
			return wrapError(errors.New("invalid arguments passed"))
		}

		if jsonTree, err := tokenize(args[0].String()); err != nil {
			return wrapError(err)
		} else {
			return js.ValueOf(jsonTree)
		}
	})
}
