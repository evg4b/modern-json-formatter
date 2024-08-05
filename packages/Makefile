default: tokenizer jq exec-script

test:
	@echo "Testing..."
	go test -v ./pkg/...

exec-script:
	@echo "Copying exec scripts..."
	rm -f ./wasm_exec.js
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" .

# Tokenizer

tokenizer: tokenizer-clean tokenizer-build tokenizer-optimize

TOKENIZER_FILE=tokenizer/tokenizer.wasm
TOKENIZER_FILE_BAK=${TOKENIZER_FILE}.bak

tokenizer-build:
	@echo "Building wasm..."
	GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w -buildid=" -o ${TOKENIZER_FILE} ./tokenizer

tokenizer-optimize:
	@echo "Optimizing wasm..."
	cp ${TOKENIZER_FILE} ${TOKENIZER_FILE_BAK}
	wasm-opt --enable-bulk-memory -Oz -o ${TOKENIZER_FILE} ${TOKENIZER_FILE_BAK}
	rm -f ${TOKENIZER_FILE_BAK}

tokenizer-clean:
	@echo "Cleaning..."
	rm -f ${TOKENIZER_FILE} ${TOKENIZER_FILE_BAK}

# JQ

jq: jq-clean jq-build jq-optimize

JQ_FILE=jq/jq.wasm
JQ_FILE_BAK=${TOKENIZER_FILE}.bak

jq-build:
	@echo "Building wasm..."
	GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w -buildid=" -o ${JQ_FILE} ./jq

jq-optimize:
	@echo "Optimizing wasm..."
	cp ${JQ_FILE} ${JQ_FILE_BAK}
	wasm-opt --enable-bulk-memory -Oz -o ${JQ_FILE} ${JQ_FILE_BAK}
	rm -f ${JQ_FILE_BAK}

jq-clean:
	@echo "Cleaning..."
	rm -f ${JQ_FILE} ${JQ_FILE_BAK}
