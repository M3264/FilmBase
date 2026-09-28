FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .
RUN npm run build

# Runner
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/ops/filmbase-alerts-sync.mjs ./ops/filmbase-alerts-sync.mjs

EXPOSE 3000
CMD ["node", "server.js"]