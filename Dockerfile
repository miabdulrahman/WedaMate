# Multi-stage Dockerfile for WedaMate Production
FROM node:20-alpine AS builder

WORKDIR /app

# Build frontend
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client ./client
RUN cd client && npm run build

# Production server runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server code and built frontend dist
COPY server ./server
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/src/server.js"]
