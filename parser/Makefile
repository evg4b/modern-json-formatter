default: clean build

build:
	@echo "Building wasm..."
	tinygo build -o parser.wasm -target wasm ./main.go

copy-exec-scripts:
	@echo "Copying exec scripts..."
	rm -f wasm_exec.js
	cp $(shell tinygo env TINYGOROOT)/targets/wasm_exec.js .

clean:
	@echo "Cleaning..."
	rm -f parser.wasm

test:
	@echo "Testing..."
	go test -v ./decode/...
