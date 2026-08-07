FROM denoland/deno:alpine-2.9.5 AS builder

ENV DENO_DIR=/deno-dir
WORKDIR /app

COPY deno.json deno.lock package.json ./

RUN deno ci

COPY . .

RUN deno cache src/index.ts


FROM denoland/deno:alpine-2.9.5 AS runtime

ENV DENO_DIR=/deno-dir
RUN adduser -D hono-user

USER hono-user
WORKDIR /app

COPY --from=builder /deno-dir /deno-dir
COPY --from=builder /app/src ./src
COPY --from=builder /app/deno.json ./
COPY --from=builder /app/deno.lock ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["deno", "run", "--cached-only", "--allow-net", "--allow-env", "--allow-sys", "src/index.ts"]
