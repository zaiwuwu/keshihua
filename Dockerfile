# Stage 1: Build React frontend
FROM node:20-alpine AS builder

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Nginx serves the SPA
FROM nginx:alpine

# Copy built frontend
COPY --from=builder /build/dist/ /usr/share/nginx/html/

# SPA fallback: all routes → index.html (compatible with HashRouter)
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
    location /api/ { return 404; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
