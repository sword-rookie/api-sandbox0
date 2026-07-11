package main

import (
	"log"
	"net/http"

	"github.com/yourusername/api-sandbox-links/orchestrator/internal/config"
	"github.com/yourusername/api-sandbox-links/orchestrator/internal/server"
)

func main() {
	cfg := config.Load()

	srv := server.NewServer(cfg)

	log.Printf("🚀 API Sandbox Orchestrator started on :%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, srv.Router))
}