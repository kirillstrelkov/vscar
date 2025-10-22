APP_NAME := vscar-back-nestjs-app

.PHONY: all fmt check clean test

all: fmt check test

clean:
	pnpm run clean

test:
	@echo "Nothing to test"

fmt:
	pnpm run format

check: check-docker check-make
	# pnpm run lint # TODO: fixme

check-docker:
	docker run --rm -i hadolint/hadolint < Dockerfile

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

run:
	pnpm run start

build: clean
	pnpm run build

docker-build:
	docker build -t ${APP_NAME} .

docker-run:
	docker run --cpus=4 --init --rm -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 ${APP_NAME}

init-db:
	docker run -d --rm -p 27017:27017 mongo
	pnpm run resetdb
