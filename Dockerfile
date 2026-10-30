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
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next copia .env a .next/standalone; se elimina en el MISMO RUN para que el
# secreto no quede commiteado en ninguna capa de la imagen.
RUN npm run build && rm -f .next/standalone/.env .next/standalone/.env.*

# Imagen final de producción
FROM runner_base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3050

# Usuario de seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 -G nodejs nextjs

# Assets y build optimizado
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Puerto 3050
EXPOSE 3050

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s \
  CMD wget -qO- http://127.0.0.1:3050/api/health || exit 1

# Iniciar servidor
CMD ["node", "server.js"]
