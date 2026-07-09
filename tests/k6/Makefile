.PHONY: all fmt check clean test

all: fmt check 

clean:
	pnpm run clean

fmt:
	pnpm run format

check: check-make

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

test: 
	K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_PERIOD=100ms K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run performance_suite.js
