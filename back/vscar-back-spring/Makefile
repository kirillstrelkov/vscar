APP_NAME := vscar-back-spring-app

.PHONY: all fmt check clean test

all: fmt check test

test:
	./gradlew test

fmt:
	./gradlew spotlessApply

check: check-make
	./gradlew check

check-make:
	go run github.com/checkmake/checkmake/cmd/checkmake@latest Makefile

clean:
	./gradlew clean

run:
	./gradlew bootRun

build: clean
	./gradlew bootJar

docker-build:
	./gradlew bootBuildImage --imageName ${APP_NAME}

docker-run:
	docker run --cpus=4 --rm -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 ${APP_NAME}
