init_env:
	python3 -m venv .venv
	. .venv/bin/activate

fmt:
	./.venv/bin/python -m ruff format .

check:
	./.venv/bin/python -m ruff check --fix .

run:
	./.venv/bin/python main.py
