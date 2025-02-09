default: build-worker-core build-extension pack-extension

check:
	@echo "Checking packages..."
	@yarn lint
	@yarn test

build-extension:
	@yarn build:production

build-worker-core:
	@echo "Building WASM..."
	@cd worker-core && $(MAKE)

pack-extension:
	@echo "Packing extension for Chrome Store..."
	@cd ./dist && zip -r -X ../extention.zip *
	@echo "Packing extension for Microsoft Store..."
	@cat ./dist/manifest.json | jq 'del(.key)' > ./dist/manifest.back.json
	@mv ./dist/manifest.back.json ./dist/manifest.json
	@cd ./dist && zip -r -X ../extention-msdn.zip *

clean:
	@echo "Cleaning extension..."
	@rm -rf ./dist
	@rm -f ./extention.zip
	@rm -f ./extention-msdn.zip
	@cd worker-core && $(MAKE) clean
