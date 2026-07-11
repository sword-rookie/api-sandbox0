package server

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/builder"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/config"
)

type Server struct {
	Router *mux.Router
}

func NewServer(cfg *config.Config) *Server {
	r := mux.NewRouter()

	// Health Check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Health check called")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"API Sandbox Orchestrator is running"}`))
	}).Methods("GET")

	// Build Endpoint
	r.HandleFunc("/build", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Build endpoint called with query:", r.URL.Query())

		repoURL := r.URL.Query().Get("repo")
		branch := r.URL.Query().Get("branch")
		if branch == "" {
			branch = "main"
		}

		if repoURL == "" {
			http.Error(w, "repo parameter is required", http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte(`{"status":"building","message":"Build started in background"}`))

		go func() {
			fmt.Println("Starting build for repo:", repoURL)
			b := builder.NewBuilder()
			result, err := b.BuildFromRepo(repoURL, branch)
			if err != nil {
				fmt.Printf("Build failed: %v\n", err)
			} else {
				fmt.Printf("Build success: %s\n", result)
			}
		}()
	}).Methods("POST")

	fmt.Println("Routes registered successfully")
	return &Server{Router: r}
}
