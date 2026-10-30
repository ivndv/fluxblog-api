# Etapa base para Node (para el final)
FROM node:24.22.1-alpine AS runner_base
WORKDIR /app

# Instalación de dependencias con Bun Oficial
FROM oven/bun:1.4.4-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Etapa de compilación (Build seguro con Node)
FROM runner_base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Imagen final de producción
FROM runner_base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Usuario de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Assets y build optimizado
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Puerto 3050
EXPOSE 3050
ENV PORT=3050

# Iniciar servidor
CMD ["node", "server.js"]
