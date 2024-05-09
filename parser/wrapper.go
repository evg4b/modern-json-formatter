package main

import (
	"github.com/evg4b/modern-json-formatter/parser/core"
	"syscall/js"
)

func ParseWrapper() js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 1 {
			return map[string]interface{}{
				"type":  "error",
				"error": "Invalid no of arguments passed",
			}
		}
		inputJSON := args[0].String()
		pretty, err := core.Parse(inputJSON)
		if err != nil {
			return errorResponse(err.Error())
		}

		return successResponse(pretty)
	})
}
