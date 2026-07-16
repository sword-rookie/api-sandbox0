package server

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/auth"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/builder"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/config"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/middleware"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/project"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/repository"
)

type Server struct {
	Router *mux.Router
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:3000"
		}
		w.Header().Set("Access-Control-Allow-Origin", frontendURL)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
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
	repo, err := repository.NewPostgresRepo(cfg)
	if err != nil {
		log.Fatalf("❌ Failed to initialize user repository: %v", err)
	}
	log.Println("💾 User repository (Postgres) initialized successfully")

	// Initialize Services & Handlers
	authService := auth.NewService(repo, cfg)
	authHandler := auth.NewHandler(authService)
	auth.InitOAuth()

	projectService := project.NewService(repo)
	projectHandler := project.NewHandler(projectService)

	// Health Check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Health check called")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"API Sandbox Orchestrator is running"}`))
	}).Methods("GET")

	// Auth Endpoints (Rate Limited)
	authRouter := r.PathPrefix("/api/auth").Subrouter()
	authRouter.Use(middleware.RateLimit)
	authRouter.HandleFunc("/register", authHandler.Register).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/login", authHandler.Login).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/login/mfa", authHandler.LoginMFA).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/mfa/generate", authHandler.GenerateMFA).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/mfa/verify", authHandler.VerifyMFA).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/{provider}/login", authHandler.BeginOAuth).Methods("GET", "OPTIONS")
	authRouter.HandleFunc("/{provider}/callback", authHandler.OAuthCallback).Methods("GET", "OPTIONS")
	authRouter.HandleFunc("/refresh", authHandler.RefreshToken).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/forgot-password", authHandler.ForgotPassword).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/validate-reset-token", authHandler.ValidateResetToken).Methods("GET", "OPTIONS")
	authRouter.HandleFunc("/reset-password", authHandler.ResetPassword).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/logout", authHandler.Logout).Methods("POST", "OPTIONS")
	authRouter.HandleFunc("/profile/me", authHandler.GetMe).Methods("GET", "OPTIONS")
	authRouter.HandleFunc("/dashboard", authHandler.GetDashboard).Methods("GET", "OPTIONS")

	// Profile Endpoints
	r.HandleFunc("/api/users/{username}", authHandler.GetProfile).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/users/me", authHandler.UpdateProfileMe).Methods("PUT", "OPTIONS")
	r.HandleFunc("/api/upload/avatar", authHandler.UploadAvatar).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/users/{id}", authHandler.DeleteProfile).Methods("DELETE", "OPTIONS")

	// Project Endpoints
	r.HandleFunc("/api/projects", projectHandler.CreateProject).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/projects", projectHandler.GetProjects).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/projects/{id}", projectHandler.GetProjectByID).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/projects/{id}", projectHandler.UpdateProject).Methods("PATCH", "OPTIONS")

	// Static files for uploads
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

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
