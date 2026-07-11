package server

import (
	"net/http"
)

type Server struct {
	Router http.Handler
}

func NewServer() *Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Orchestrator running"))
	})

	return &Server{
		Router: mux,
	}
}
