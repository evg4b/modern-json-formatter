default: build-packages build-extension pack-extension

check:
	@echo "Checking packages..."
	yarn prettier . --check
	yarn lint
	yarn test

build-extension:
	yarn build:production

build-packages:
	@echo "Building wasms..."
	cd packages && $(MAKE)

pack-extension:
	cd ./dist && zip -r -X ../extention.zip *

prepare:
	if [ ! -f packages/jq/jq.wasm ];then cd packages && $(MAKE) jq; fi;
	if [ ! -f packages/tokenizer/tokenizer.wasm ];then cd packages && $(MAKE) tokenizer; fi;
	if [ ! -f packages/wasm_exec.js ];then cd packages && $(MAKE) exec-script; fi;

