init_env:
	python3 -m venv .venv
	. .venv/bin/activate

fmt:
	./.venv/bin/python -m ruff format .

check:
	./.venv/bin/python -m ruff check --fix .

run:
	./.venv/bin/python main.py

docker_build:
	docker build -t vscar-back-fastapi-app .

docker_run:
	docker run -e PROD= -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 vscar-back-fastapi-app
