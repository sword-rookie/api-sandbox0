FROM golang:1.26-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o orchestrator ./cmd

# Final image
FROM alpine:latest

# Install Nixpacks for x86_64 (amd64)
RUN apk add --no-cache ca-certificates git curl && \
    curl -L -o /usr/local/bin/nixpacks https://github.com/railwayapp/nixpacks/releases/latest/download/nixpacks-linux-amd64 && \
    chmod +x /usr/local/bin/nixpacks

WORKDIR /root/
COPY --from=builder /app/orchestrator .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080
CMD ["./orchestrator"]