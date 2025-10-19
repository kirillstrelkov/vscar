FROM node:24-alpine AS builder

RUN npm install -g pnpm

RUN apk update && apk add --no-cache bind-tools

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build --output-path=./dist/car-vs-fe --configuration production

FROM nginx:alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist/car-vs-fe /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
