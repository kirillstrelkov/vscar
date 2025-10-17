FROM node:24-alpine AS builder

ENV PNPM_HOME="/usr/local/bin"
RUN npm install -g pnpm
WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --store-dir /pnpm-store 

COPY . .
RUN pnpm run build


FROM node:24-alpine AS runtime

ENV PNPM_HOME="/usr/local/bin"
RUN npm install -g pnpm
RUN adduser -D nestjs-user
USER nestjs-user
WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./ 

COPY --from=builder /pnpm-store /pnpm-store

RUN pnpm install --prod --store-dir /pnpm-store

CMD ["node", "dist/src/main"]
