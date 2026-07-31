# Stage 1: Build React frontend
FROM node:20-alpine AS builder

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: PocketBase + frontend
FROM alpine:3.20

RUN apk add --no-cache unzip wget ca-certificates

# Download PocketBase Linux amd64
ARG PB_VERSION=0.25.9
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O /tmp/pb.zip \
    && unzip -o /tmp/pb.zip -d /usr/local/bin/ \
    && chmod +x /usr/local/bin/pocketbase \
    && rm /tmp/pb.zip

WORKDIR /app

# Copy built frontend from Stage 1
COPY --from=builder /build/dist/ /app/pb_public/

# Database migrations
COPY pb_migrations/ /app/pb_migrations/

# Local database (overridden by Render Disk at runtime)
COPY pb_data/ /app/pb_data/

EXPOSE 8090

CMD ["sh", "-c", "/usr/local/bin/pocketbase serve --http=0.0.0.0:${PORT:-8090}"]
