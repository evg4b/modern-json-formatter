default: clean build

test:
	@echo "Testing..."
	go test -v ./pkg/...

exec-script:
	@echo "Copying exec scripts..."
	rm -f ./wasm_exec.js
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" .

WASM_FILE=worker-core.wasm
WASM_FILE_BAK=${WASM_FILE}.bak

build:
	@echo "Building..."
	GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w -buildid=" -o ${WASM_FILE} .

optimize:
	@echo "Optimizing..."
	cp ${WASM_FILE} ${WASM_FILE_BAK}
	wasm-opt --enable-bulk-memory -Oz -o ${WASM_FILE} ${WASM_FILE_BAK}
	rm -f ${WASM_FILE_BAK}

clean:
	@echo "Cleaning..."
	rm -f ${WASM_FILE} ${WASM_FILE_BAK}
