default: tokenizer jq exec-scripts

exec-scripts:
	@echo "Copying exec scripts..."
	rm -f ../wasm_exec.js
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" ./..

# Tokenizer

tokenizer: tokenizer-clean tokenizer-build tokenizer-optimize tokenizer-copy

TOKENIZER_FILE=tokenizer.wasm
TOKENIZER_FILE_BAK=${TOKENIZER_FILE}.bak
TOKENIZER_DIST=../tokenizer

tokenizer-build:
	@echo "Building wasm..."
	GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w -buildid=" -o ${TOKENIZER_FILE} ./wasm/tokenizer

tokenizer-optimize:
	@echo "Optimizing wasm..."
	cp ${TOKENIZER_FILE} ${TOKENIZER_FILE_BAK}
	wasm-opt --enable-bulk-memory -Oz -o ${TOKENIZER_FILE} ${TOKENIZER_FILE_BAK}
	rm -f ${TOKENIZER_FILE_BAK}

tokenizer-clean:
	@echo "Cleaning..."
	rm -f ${TOKENIZER_FILE} ${TOKENIZER_FILE_BAK}

tokenizer-test:
	@echo "Testing..."
	go test -v ./tokenizer/...

tokenizer-copy:
	@echo "Copying to dist..."
	cp ${TOKENIZER_FILE} ${TOKENIZER_DIST}

# JQ

jq: jq-clean jq-build jq-optimize jq-copy

JQ_FILE=jq.wasm
JQ_FILE_BAK=${TOKENIZER_FILE}.bak
JQ_DIST=../jq

jq-build:
	@echo "Building wasm..."
	GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w -buildid=" -o ${JQ_FILE} ./wasm/jq

jq-optimize:
	@echo "Optimizing wasm..."
	cp ${JQ_FILE} ${JQ_FILE_BAK}
	wasm-opt --enable-bulk-memory -Oz -o ${JQ_FILE} ${JQ_FILE_BAK}
	rm -f ${JQ_FILE_BAK}

jq-clean:
	@echo "Cleaning..."
	rm -f ${JQ_FILE} ${JQ_FILE_BAK}

jq-copy:
	@echo "Copying to dist..."
	cp ${JQ_FILE} ${JQ_DIST}
