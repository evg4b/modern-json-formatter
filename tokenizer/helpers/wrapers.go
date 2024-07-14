package helpers

import "syscall/js"

func WrapError(err error) js.Value {
	return js.ValueOf(map[string]any{
		"type":  "error",
		"error": err.Error(),
	})
}
