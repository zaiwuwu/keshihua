FROM alpine:3.20

# Install dependencies
RUN apk add --no-cache unzip wget ca-certificates

# Download PocketBase Linux amd64 binary (matches JS SDK v0.26.x)
ARG PB_VERSION=0.25.9
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O /tmp/pb.zip \
    && unzip -o /tmp/pb.zip -d /usr/local/bin/ \
    && chmod +x /usr/local/bin/pocketbase \
    && rm /tmp/pb.zip

WORKDIR /app

# Frontend static files — PocketBase serves pb_public at root
COPY dist/ /app/pb_public/

# Database migrations (schema definitions)
COPY pb_migrations/ /app/pb_migrations/

# Local data — included for initial sync; Render Disk overrides this at runtime
COPY pb_data/ /app/pb_data/

# PocketBase serves API + frontend on a single port
EXPOSE 8090

CMD ["sh", "-c", "/usr/local/bin/pocketbase serve --http=0.0.0.0:${PORT:-8090}"]
