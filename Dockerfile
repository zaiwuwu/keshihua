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

# PocketBase — 版本与本地 pb_data 保持一致
ARG PB_VERSION=0.27.0
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O /tmp/pb.zip \
    && unzip -o /tmp/pb.zip -d /usr/local/bin/ \
    && chmod +x /usr/local/bin/pocketbase \
    && rm /tmp/pb.zip

WORKDIR /app

# 前端静态文件 → PocketBase 从 pb_public 提供
COPY --from=builder /build/dist/ /app/pb_public/

EXPOSE 8090

# PocketBase 启动时自动创建 pb_data（挂载到 Render Disk）
CMD ["sh", "-c", "/usr/local/bin/pocketbase serve --http=0.0.0.0:${PORT:-8090}"]
