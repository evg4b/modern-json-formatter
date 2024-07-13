default: clean build

build:
	@echo "Building wasm..."
	GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w -buildid=" -o parser.wasm

copy-exec-scripts:
	@echo "Copying exec scripts..."
	rm -f wasm_exec.js
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" .

clean:
	@echo "Cleaning..."
	rm -f parser.wasm

test:
	@echo "Testing..."
	go test -v ./decode/...
