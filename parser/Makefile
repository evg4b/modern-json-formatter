default: clean build copy-exec-scripts

build:
	@echo "Building wasm..."
	GOOS=js GOARCH=wasm go build -o parser.wasm -v .

copy-exec-scripts:
	@echo "Copying exec scripts..."
	cp $(shell go env GOROOT)/misc/wasm/wasm_exec.js .

clean:
	@echo "Cleaning..."
	rm -f parser.wasm
	rm -f wasm_exec.js

test:
	@echo "Testing..."
	go test -v ./core/...
