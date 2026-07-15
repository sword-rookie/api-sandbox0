package main

import (
	"log"
	"net/http"

	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/config"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/server"
)

func main() {
	cfg := config.Load()

	srv := server.NewServer(cfg)

	log.Printf("🚀 API Sandbox Orchestrator started on :%s", cfg.AppPort)
	log.Fatal(http.ListenAndServe(":"+cfg.AppPort, srv.Router))
}
