CLUSTER_NAME := vscar
HOST_PORT    := 8080
NAMESPACE    := vscar
DB_URI       ?= mongodb://host.k3d.internal:27017/vscar
BACKENDS     := nestjs fastapi gin rocket ktor spring

SERVER_NODE  := k3d-$(CLUSTER_NAME)-server-0

.PHONY: all cluster-create cluster-start cluster-stop cluster-clean \
        images-build deploy undeploy status help

.DEFAULT_GOAL := help

all: cluster-create images-build deploy  ## Create cluster, build + import images, deploy everything

# ── Cluster ──────────────────────────────────────────────────────────────────

cluster-create:  ## Create k3d cluster: 1 server + 3 agents, port $(HOST_PORT)->80
	k3d cluster create $(CLUSTER_NAME) \
		--agents 3 \
		-p "$(HOST_PORT):80@loadbalancer"
	kubectl taint nodes $(SERVER_NODE) \
		node-role.kubernetes.io/control-plane:NoSchedule --overwrite

cluster-start:  ## Start a previously stopped cluster
	k3d cluster start $(CLUSTER_NAME)

cluster-stop:  ## Stop the cluster (preserves state)
	k3d cluster stop $(CLUSTER_NAME)

cluster-clean:  ## Delete the cluster entirely
	k3d cluster delete $(CLUSTER_NAME)

# ── Images ────────────────────────────────────────────────────────────────────

images-build:  ## Build all backend images and import them into the cluster
	@for backend in $(BACKENDS); do \
		echo "==> Building vscar-back-$$backend-app..."; \
		$(MAKE) -C ../back/vscar-back-$$backend docker-build; \
		echo "==> Importing vscar-back-$$backend-app into k3d cluster '$(CLUSTER_NAME)'..."; \
		k3d image import vscar-back-$$backend-app:latest -c $(CLUSTER_NAME); \
	done

# ── Deploy ────────────────────────────────────────────────────────────────────

deploy:  ## Apply all Kubernetes manifests
	kubectl apply -f manifests/

undeploy:  ## Delete all deployed manifests (ignores missing)
	kubectl delete -f manifests/ --ignore-not-found

# ── Observability ─────────────────────────────────────────────────────────────

status:  ## Show nodes, pods, services, and ingress routes
	@echo "\n=== Nodes ==="; \
	kubectl get nodes -o wide; \
	echo "\n=== Pods ($(NAMESPACE)) ==="; \
	kubectl get pods -n $(NAMESPACE) -o wide; \
	echo "\n=== Services ($(NAMESPACE)) ==="; \
	kubectl get svc -n $(NAMESPACE); \
	echo "\n=== IngressRoutes ($(NAMESPACE)) ==="; \
	kubectl get ingressroute -n $(NAMESPACE) 2>/dev/null || true

help:  ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  %-20s %s\n", $$1, $$2}'
