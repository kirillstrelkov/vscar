.PHONY: all fmt check clean test

all: fmt check

init_env:
	python3 -m venv .venv
	. .venv/bin/activate

fmt:
	./.venv/bin/python -m ruff format .

check: check-make
	./.venv/bin/python -m ruff check --fix .

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

clean:
	# nothing to do

test-api:
	./.venv/bin/python -m pytest api

test-func:
	./.venv/bin/python -m pytest func --retries 3

test: test-api test-func
