default: clean build optimize copy-exec-scripts

WASM_FILE=tokenizer.wasm
WASM_FILE_BAK=${WASM_FILE}.bak

build:
	@echo "Building wasm..."
	GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w -buildid=" -o ${WASM_FILE}

optimize:
	@echo "Optimizing wasm..."
	cp ${WASM_FILE} ${WASM_FILE_BAK}
	wasm-opt --enable-bulk-memory -Oz -o ${WASM_FILE} ${WASM_FILE_BAK}
	rm -f ${WASM_FILE_BAK}

copy-exec-scripts:
	@echo "Copying exec scripts..."
	rm -f wasm_exec.js
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" .

clean:
	@echo "Cleaning..."
	rm -f ${WASM_FILE}

test:
	@echo "Testing..."
	go test -v ./tokenizer/...
