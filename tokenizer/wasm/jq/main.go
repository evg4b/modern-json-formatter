package main

import (
	"encoding/json"
	"fmt"
	"github.com/itchyny/gojq"
	"log"
	"strings"
)

func main() {
	decoder := json.NewDecoder(strings.NewReader(`{"foo": [11231232132132132131231231233213213123123123321321312312312332132131231231233213213123123123123123123123123123123123123213123123123, 2, 3]}`))
	decoder.UseNumber()
	var v interface{}
	if err := decoder.Decode(&v); err != nil {
		log.Fatalln(err)
	}

	query, err := gojq.Parse(".foo | ..")
	if err != nil {
		log.Fatalln(err)
	}
	//input := map[string]any{"foo": []any{1, 2, 3}}
	iter := query.Run(v) // or query.RunWithContext
	for {
		v, ok := iter.Next()
		if !ok {
			break
		}
		if err, ok := v.(error); ok {
			if err, ok := err.(*gojq.HaltError); ok && err.Value() == nil {
				break
			}
			log.Fatalln(err)
		}
		fmt.Printf("%#v\n", v)
	}
}
