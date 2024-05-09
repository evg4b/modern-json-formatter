package main

import (
	"syscall/js"
)

func main() {
	js.Global().Set("parseJSON", ParseWrapper())
	<-make(chan struct{})
}
