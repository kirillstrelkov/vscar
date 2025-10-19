APP_NAME := vscar-front-angular-app

.PHONY: all fmt check clean test

all: fmt check test

clean:
	pnpm run clean

test:
	#pnpm run test # TODO: fixme

fmt:
	pnpm run format

check: check-docker check-make
	pnpm run lint-fix
	pnpm run lint

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
	docker run --init --rm -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 80:80 ${APP_NAME}
