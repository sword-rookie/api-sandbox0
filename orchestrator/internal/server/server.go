package server

import (
	"net/http"

	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/config"
)

type Server struct {
	Router http.Handler
}

func NewServer(cfg *config.Config) *Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Orchestrator running"))
	})

	return &Server{
		Router: mux,
	}
}
