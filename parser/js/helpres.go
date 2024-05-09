package js

func errorResponse(error string) map[string]any {
	return map[string]any{
		"type":  "error",
		"error": error,
	}
}

func successResponse(value map[string]any) map[string]any {
	return map[string]any{
		"type":  "response",
		"value": value,
	}
}
