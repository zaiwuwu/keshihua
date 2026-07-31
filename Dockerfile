# Stage 1: Build React frontend
FROM node:20-alpine AS builder

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Node.js server (Express + PostgreSQL API + static frontend)
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --omit=dev

COPY --from=builder /build/dist/ /app/dist/
COPY server.js /app/

EXPOSE 3000

CMD ["node", "server.js"]
