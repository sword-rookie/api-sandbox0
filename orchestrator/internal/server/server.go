package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/auth"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/builder"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/config"
)

type Server struct {
	Router *mux.Router
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func NewServer(cfg *config.Config) *Server {
	r := mux.NewRouter()

	// Apply CORS middleware globally
	r.Use(corsMiddleware)

	// Initialize Database Repository
	dbPath := "/volumes/clarity.db"
	repo, err := auth.NewSQLiteRepository(dbPath)
	if err != nil {
		log.Fatalf("❌ Failed to initialize user repository: %v", err)
	}
	log.Println("💾 User repository (SQLite) initialized successfully")

	// Initialize Services & Handlers
	authService := auth.NewService(repo)
	authHandler := auth.NewHandler(authService)

	// Health Check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Health check called")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"API Sandbox Orchestrator is running"}`))
	}).Methods("GET")

	// Auth Endpoints
	r.HandleFunc("/api/auth/register", authHandler.Register).Methods("POST", "OPTIONS")

	// Profile Endpoints
	r.HandleFunc("/api/users/{username}", authHandler.GetProfile).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/users/{id}", authHandler.UpdateProfile).Methods("PUT", "OPTIONS")
	r.HandleFunc("/api/users/{id}", authHandler.DeleteProfile).Methods("DELETE", "OPTIONS")

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
