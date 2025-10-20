APP_NAME := vscar-back-fastapi-app

.PHONY: all fmt check clean test

all: fmt check test

clean:
	@echo "Nothing to clean"

test:
	@echo "Nothing to test"

init_env:
	python3 -m venv .venv
	. .venv/bin/activate

fmt:
	./.venv/bin/python -m ruff format .

check: check-docker check-make
	./.venv/bin/python -m ruff check --fix .

check-docker:
	docker run --rm -i hadolint/hadolint < Dockerfile

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

run:
	PROD= ./.venv/bin/python -m uvicorn main:app --workers 4 --host "0.0.0.0" --port 3000 

docker-build:
	docker build -t ${APP_NAME} .

docker-run:
	docker run --cpus=4 --rm -e PROD= -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 ${APP_NAME}
