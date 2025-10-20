APP_NAME := vscar-back-rocket-app

.PHONY: all fmt check clean test

all: fmt check test

clean:
	cargo clean

check: check-docker check-make
	cargo fix --allow-dirty
	cargo check
	cargo clippy

check-docker:
	docker run --rm -i hadolint/hadolint < Dockerfile

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

fmt:
	cargo fmt

build: clean
	cargo build

test:
	cargo test

cov:
	cargo llvm-cov --html

run:
	RUST_LOG=info cargo run --release

docker-build:
	docker build -t ${APP_NAME} .

docker-run:
	docker run --cpus=4 --rm -e ROCKET_PORT=3000 -e ROCKET_ADDRESS=0.0.0.0 -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 ${APP_NAME}
