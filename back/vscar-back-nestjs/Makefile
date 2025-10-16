
fmt:
	pnpm run format

check:
	pnpm run lint

run:
	pnpm run start

docker_build:
	docker build -t vscar-back-nestjs-app .

docker_run:
	docker run -e DATABASE_URI=mongodb://172.17.0.1:27017/vscar -p 3000:3000 vscar-back-nestjs-app
