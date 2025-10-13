init_env:
	python3 -m venv .venv
	. .venv/bin/activate

fmt:
	./.venv/bin/python -m ruff format .

check:
	./.venv/bin/python -m ruff check --fix .

test_api:
	./.venv/bin/python -m pytest api

test_func:
	./.venv/bin/python -m pytest func --retries 3
