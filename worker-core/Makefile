default: clean build optimize

exec-script:
	@echo "Copying exec scripts..."
	@rm -f ./wasm_exec.js
	@cp "$(shell tinygo env TINYGOROOT)/targets/wasm_exec.js" .

WASM_FILE=worker-core.wasm
WASM_FILE_BAK=${WASM_FILE}.bak

build:
	@echo "Building worker-core..."
	@tinygo build -o ${WASM_FILE} -no-debug -target wasm .

optimize:
	@echo "Optimizing ${WASM_FILE}..."
	@cp ${WASM_FILE} ${WASM_FILE_BAK}
	@wasm-opt --enable-bulk-memory -Oz -o ${WASM_FILE} ${WASM_FILE_BAK}
	@rm -f ${WASM_FILE_BAK}

clean:
	@echo "Cleaning worker-core..."
	@rm -f ${WASM_FILE} ${WASM_FILE_BAK}

test:
	@echo "Testing worker-core..."
	@go test -v ./internal/...
