default: build-packages build-extension pack-extension

build-extension:
	yarn build:production

build-packages:
	@echo "Building wasms..."
	cd packages/binaries && $(MAKE)

pack-extension:
	cd ./dist && zip -r -X ../extention.zip *
