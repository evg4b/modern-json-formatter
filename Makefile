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
