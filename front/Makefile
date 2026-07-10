APP_NAME := vscar-front-angular-app

.PHONY: all fmt check clean test

all: fmt check test

clean:
	bun run clean

test:
	#bun run test # TODO: fixme

fmt:
	bun run format

check: check-docker check-make
	bun run lint-fix
	bun run lint

check-docker:
	docker run --rm -i hadolint/hadolint < Dockerfile

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

run:
	bun run start

build: clean
	bun run build

docker-build:
	docker build -t ${APP_NAME} .

docker-run:
	docker run --init --rm -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 80:80 ${APP_NAME}
