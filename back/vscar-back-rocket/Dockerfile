FROM rust:1.90-slim AS builder

WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:trixie-slim

RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY --from=builder /app/target/release/vscar-back-rocket /usr/local/bin/

USER appuser

EXPOSE 3000

ENV RUST_LOG=info

CMD ["vscar-back-rocket"]
