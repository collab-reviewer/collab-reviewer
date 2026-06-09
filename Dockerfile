FROM oven/bun:1 AS base
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

FROM oven/bun:1 AS production
WORKDIR /app
COPY --from=base /app/.output ./.output
EXPOSE 3000
CMD ["bun","run", ".output/server/index.mjs"]