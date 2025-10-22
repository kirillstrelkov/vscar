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

images-show:
	docker images | grep "REPOSITORY\|vscar-back" | sort -k7 -h

images-build:
	./.venv/bin/python build_dockers.py

quick-perf-check:
	./.venv/bin/python perf_test/perf_utils.py --simple

run-perf-back-%:
	./.venv/bin/python perf_test/run_perf_back.py --app $* --force

