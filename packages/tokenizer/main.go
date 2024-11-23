package main

import (
	"errors"
	"packages/pkg/core"
	"packages/pkg/tokenizer"
	"syscall/js"
)

func main() {
	window := js.Global()
	window.Set("___tokenizeJSON", wrapperTokenize(tokenizer.Tokenize))
	window.Set("___formatJSON", wrapperFormat(tokenizer.Format))
	<-make(chan struct{})
}

func wrapperFormat(format func(input string) (string, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 1 {
			return js.ValueOf(core.ErrorNode(
				"format",
				errors.New("invalid arguments passed"),
			))
		}

		if jsonString, err := format(args[0].String()); err != nil {
			return js.ValueOf(core.ErrorNode(
				"format",
				err,
			))
		} else {
			return js.ValueOf(jsonString)
		}
	})
}

func wrapperTokenize(tokenize func(input string) (map[string]any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 1 {
			return js.ValueOf(core.ErrorNode(
				"tokenizer",
				errors.New("invalid arguments passed"),
			))
		}

		if jsonTree, err := tokenize(args[0].String()); err != nil {
			return js.ValueOf(core.ErrorNode(
				"tokenizer",
				err,
			))
		} else {
			return js.ValueOf(jsonTree)
		}
	})
}
