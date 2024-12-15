default:
	@echo "Please specify a target to build"

test:
	@echo "Testing..."
	go test -v ./pkg/...


exec-script:
	@echo "Copying exec scripts..."
	rm -f ./wasm_exec.js
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" .
