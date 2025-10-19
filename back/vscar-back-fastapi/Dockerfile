FROM python:3.12-slim AS builder

RUN pip install --no-cache-dir "uv==0.9.1"

COPY *.py pyproject.toml uv.lock /app/

WORKDIR /app

RUN uv sync --no-install-project --no-dev --locked 

FROM python:3.12-slim

RUN groupadd -g 1234 user && \
    useradd -m -u 1234 -g user user

COPY --from=builder --chown=user:user /app /app

USER user
WORKDIR /app

EXPOSE 3000

CMD [".venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
