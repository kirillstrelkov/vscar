FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . /app
WORKDIR /app

RUN groupadd -g 1234 user && \
    useradd -m -u 1234 -g user user

USER user

RUN uv sync --locked

CMD ["uv", "run", "main.py"]
