set shell := ["fish", "-c"]

fdev: 
  cd example && pnpm run dev

fgen:
  cd example && pnpm dlx protoc -I=../example-spec/ example.proto --ts_out=./src/protobuf-ts-gen

bdev:
  cd example-api && cargo watch -x run

btest:
  grpcurl -plaintext -import-path ./example-spec/ -proto example.proto '127.0.0.1:50051' example.HealthCheckService/CheckHealth

ci: test fmt clippy # audit # coverage

audit:
  cd example && pnpm audit
  cd example-api && cargo deny check advisories

test:
  cd example && pnpm test run
  cd example-api && cargo test --all-features

fmt:
  cd example && pnpm prettier --check .
  cd example-api && cargo fmt --all -- --check

clippy:
  cd example && pnpm eslint --max-warnings=0
  cd example-api && cargo clippy -- -D warnings

coverage:
  cd example && pnpm test -- --coverage
  cd example-api && cargo tarpaulin --ignore-tests

unused:
  cd example && pnpm prune
  cd example-api && cargo +nightly udeps --workspace

outdated:
  cd example && pnpm outdated
  cd example-api && cargo outdated --root-deps-only --workspace

migrate:
  cd example && npx protoc -I=../example-spec/ example.proto --ts_out=./src/protobuf-ts-gen
  cd example-api && diesel migration redo --all

fmtwrite:
  cd example && pnpm prettier --write .
  cd example-api && cargo fmt --all