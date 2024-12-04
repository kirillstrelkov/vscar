all: fmt check

cur_dir = $(shell pwd)
py = $(cur_dir)/.venv/bin/python

init:
	rm -rf $(cur_dir)/.venv
	python3 -m venv $(cur_dir)/.venv
	$(py) -m pip install $(cur_dir)/.
	$(py) -m pip uninstall -y perf-test

clean:
	rm -rf $(cur_dir)/.venv
	$(cur_dir)/.venv/bin/ruff clean

fmt:
	$(cur_dir)/.venv/bin/ruff format

fix:
	$(cur_dir)/.venv/bin/ruff check --fix

check:
	$(cur_dir)/.venv/bin/ruff check

run:
	$(py) run_perf.py --url http://localhost:3000/
