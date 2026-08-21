# syntax=docker/dockerfile:1

# ---- Base: Node 20 + pnpm ----
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

# ---- Build: install semua deps, generate Prisma Client, compile ----
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm prisma:generate && pnpm build

# ---- Runner: image final ----
# node_modules penuh dipertahankan karena migrasi & seed saat start memakai
# Prisma CLI + ts-node (bukan hanya dependency runtime).
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
EXPOSE 4000
CMD ["node", "dist/main.js"]
