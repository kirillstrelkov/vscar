all: fix fmt check build test

clean:
	cargo clean

check:
	cargo check
	cargo clippy

fmt:
	cargo fmt

build:
	cargo build

test:
	cargo test

cov:
	cargo llvm-cov --html

run:
	cargo run

fix:
	cargo fix --allow-dirty

docker_build:
	docker build -t vscar-back-rocket-app .

docker_run:
	docker run -e ROCKET_PORT=3000 -e ROCKET_ADDRESS=0.0.0.0 -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 vscar-back-rocket-app
