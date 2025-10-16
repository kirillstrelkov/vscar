docker_build:
	docker build -t vscar-back-gin-app .

docker_run:
	docker run -e PORT=3000 -e GIN_MODE=release -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 vscar-back-gin-app
