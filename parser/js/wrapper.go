package js

import (
	"github.com/evg4b/modern-json-formatter/parser/decode"
	"syscall/js"
)

func ParseWrapper() js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) != 1 {
			return map[string]interface{}{
				"type":  "error",
				"error": "Invalid arguments passed",
			}
		}

		jsonTree, err := decode.Decode(args[0].String())
		if err != nil {
			return map[string]any{
				"type":  "error",
				"error": err.Error(),
			}
		}

		return jsonTree
	})
}
