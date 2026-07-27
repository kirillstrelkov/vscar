BACKENDS    := nestjs fastapi gin rocket ktor spring
K8S_HOST    ?= http://localhost:8080
RESULTS_DIR := data/k8s

.PHONY: all fmt check clean test test-k8s

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

# ── k8s: run against every backend deployed via k8s/manifests/ingress.yaml ────
# Requires the k3d cluster + backends to already be up (see `make -C ../../k8s all`).

test-k8s:  ## Run the k6 suite against every backend on k8s and collect summary JSON per backend
	@mkdir -p $(RESULTS_DIR)
	@for backend in $(BACKENDS); do \
		echo "==> Running k6 against $$backend ($(K8S_HOST)/$$backend)..."; \
		BACKEND_URL=$(K8S_HOST)/$$backend k6 run --quiet --summary-export=$(RESULTS_DIR)/$$backend.json performance_suite.js; \
	done
	@echo "Done. Open Analysis.ipynb to compare filter_prices_duration across backends."
