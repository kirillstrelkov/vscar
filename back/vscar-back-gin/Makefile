APP_NAME := vscar-back-gin-app

.PHONY: all fmt check clean test

all: fmt check test

clean:
	go clean

test:
	go test ./...

fmt:
	go fmt ./...

check: check-docker check-make
	@echo "Nothing to check"

check-docker:
	docker run --rm -i hadolint/hadolint < Dockerfile

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

run:
	go run src/main.go

build: clean
	go build

docker-build:
	docker build -t ${APP_NAME} .

docker-run:
	docker run --cpus=4 --init --rm -e PORT=3000 -e GIN_MODE=release -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 ${APP_NAME}
