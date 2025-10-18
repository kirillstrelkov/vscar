
fmt:
	./gradlew spotlessApply

check:
	./gradlew check

clean:
	./gradlew clean

run:
	./gradlew bootRun

build:
	./gradlew bootJar

docker_build:
	./gradlew bootBuildImage --imageName vscar-back-spring-app

docker_run:
	docker run -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 vscar-back-spring-app
