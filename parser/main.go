package main

import (
	wraper "github.com/evg4b/modern-json-formatter/parser/js"
	"syscall/js"
)

func main() {
	js.Global().Set("parseJSON", wraper.ParseWrapper())
	<-make(chan struct{})
}
