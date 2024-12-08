# Rust backend

## Run in development

```sh
RUST_BACKTRACE=1 cargo watch -x run
```

## Run

```sh
cargo run
```

## Lint

```sh
cargo clippy
```

## Format

```sh
cargo fmt
```

## Tests

### Prerequisites

1. mongodb should be running
2. data should be populated(`npm run resetdb`)
3. VPN should be disabled

```sh
cargo test
```
