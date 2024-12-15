package main

import (
	"errors"
	"syscall/js"
	"worker-core/internal/core"
	"worker-core/internal/jq"
	"worker-core/internal/tokenizer"
)

func main() {
	window := js.Global()
	window.Set("___tokenizeJSON", wrapperTokenize(tokenizer.Tokenize))
	window.Set("___formatJSON", wrapperFormat(tokenizer.Format))
	window.Set("___jq", wrapper(jq.Query))
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

func wrapper(query func(input string, query string) (any, error)) js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 2 {
			return js.ValueOf(core.ErrorNode(
				"jq",
				errors.New("invalid arguments passed"),
			))
		}

		if jsonTree, err := query(args[0].String(), args[1].String()); err != nil {
			return js.ValueOf(core.ErrorNode(
				"jq",
				err,
			))
		} else {
			return js.ValueOf(jsonTree)
		}
	})
}
