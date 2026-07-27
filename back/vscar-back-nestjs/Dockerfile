FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .
RUN bun run build && cp tsconfig.json dist/tsconfig.json


FROM oven/bun:1-alpine AS runtime

RUN adduser -D nestjs-user

USER nestjs-user
WORKDIR /app

COPY --from=builder /app/dist ./

COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

RUN bun install --frozen-lockfile --production

EXPOSE 3000

CMD ["bun", "src/main"]
