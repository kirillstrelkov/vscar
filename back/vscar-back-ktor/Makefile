APP_NAME := vscar-back-ktor-app

.PHONY: all fmt check clean test

all: fmt check test

test:
	@echo "Nothing to test" # TODO: fixme
	./gradlew test

fmt:
	./gradlew spotlessApply

check: check-make
	./gradlew spotlessCheck

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

clean:
	./gradlew clean

run:
	./gradlew bootRun

build:
	./gradlew bootJar

docker-build:
	./gradlew jibDockerBuild --image="${APP_NAME}:latest"

docker-run:
	docker run --rm -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 ${APP_NAME}
