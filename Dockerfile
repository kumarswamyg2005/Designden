# ─── Stage 1: Build React frontend ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ─── Stage 2: Production image ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built frontend and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.cjs ./server.cjs
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/public ./public

# Create uploads directory
RUN mkdir -p uploads/designs uploads/graphics images/graphics

EXPOSE 5174

ENV NODE_ENV=production
ENV PORT=5174

CMD ["node", "server.cjs"]
