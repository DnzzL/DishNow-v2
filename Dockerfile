FROM oven/bun:latest as base

ARG NUXT_PUBLIC_POCKETBASE_URL
ENV NUXT_PUBLIC_POCKETBASE_URL=$NUXT_PUBLIC_POCKETBASE_URL

WORKDIR /app

COPY bun.lock package.json turbo.json ./
COPY apps/web/package.json ./apps/web/

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM oven/bun:latest as runner

WORKDIR /app

COPY --from=base /app/apps/web/.output ./

EXPOSE 3000

CMD ["bun", "run", "./server/index.mjs"]
