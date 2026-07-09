.PHONY: all fmt check clean test

all: fmt check 

clean:
	pnpm run clean

fmt:
	pnpm run format

check: check-make

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

test-front:
	pnpm run test:front

test-back:
	pnpm run test:back

test: 
	pnpm run test
