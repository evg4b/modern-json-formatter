build:
	wasm-pack build --release
test:
	cargo test --manifest-path core/Cargo.toml
bench:
	cargo bench --manifest-path core/Cargo.toml --bench json
clear:
	rm -rf pkg target core/target
