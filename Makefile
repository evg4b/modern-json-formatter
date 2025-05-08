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
	@rm -f ./worker-core/*.out
	@rm -f ./worker-core/worker-core.wasm
	@rm -f ./worker-core/worker-core.wasm.bak
	@rm -f ./worker-core/wasm_exec.js
	@cd worker-core && $(MAKE) clean

release:
	@echo "Updating version ($(TYPE))..."
	@VERSION=$$(jq -r '.version' package.json) && \
	NEW_VERSION=$$(semver -i $(TYPE) $$VERSION) && \
		jq --arg v "$$NEW_VERSION" '.version = $$v' package.json > package.tmp && mv package.tmp package.json && \
		echo "Updated version: $$NEW_VERSION"
	@$(MAKE) check
	@$(MAKE) default
	@NEW_VERSION=$$(jq -r '.version' package.json) && \
		git add . && \
		git commit -m "Bump new version $$NEW_VERSION" && \
		git tag -a "v$$NEW_VERSION" -m "Release $$NEW_VERSION"
	@git push --tags

EXT_DIR := $(shell pwd)/dist
TEMP_DIR := $(shell mktemp -d)

screen-shot:
	@echo "Taking screen shot..."
	open -n -a "Google Chrome" --args \
		--user-data-dir="$(TEMP_DIR)" \
		--disable-extensions-except="$(EXT_DIR)" \
		--load-extension="$(EXT_DIR)" \
		--no-first-run \
		--no-default-browser-check \
		--new-window \
		--disable-background-mode \
		--window-size=1280,720 \
		'https://evg4b.github.io/modern-json-formatter'
