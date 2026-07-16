package project

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/auth"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/dto"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) CreateProject(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("access_token")
	if err != nil {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := auth.ValidateAccessToken(cookie.Value)
	if err != nil {
		http.Error(w, `{"error": "invalid token"}`, http.StatusUnauthorized)
		return
	}

	var req dto.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid payload"}`, http.StatusBadRequest)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	project, err := h.service.CreateProject(userUUID, &req)
	if err != nil {
		http.Error(w, `{"error": "Failed to create project"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dto.MapProjectToResponse(*project))
}

func (h *Handler) GetProjects(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("access_token")
	if err != nil {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := auth.ValidateAccessToken(cookie.Value)
	if err != nil {
		http.Error(w, `{"error": "invalid token"}`, http.StatusUnauthorized)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	projects, err := h.service.GetProjectsByUserID(userUUID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch projects"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dto.MapProjectsToResponse(projects))
}

func (h *Handler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("access_token")
	if err != nil {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := auth.ValidateAccessToken(cookie.Value)
	if err != nil {
		http.Error(w, `{"error": "invalid token"}`, http.StatusUnauthorized)
		return
	}
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	projectIDStr := mux.Vars(r)["id"]
	projectUUID, err := uuid.Parse(projectIDStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid project ID"}`, http.StatusBadRequest)
		return
	}

	var req dto.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid payload"}`, http.StatusBadRequest)
		return
	}

	project, err := h.service.UpdateProject(userUUID, projectUUID, &req)
	if err != nil {
		if err == ErrProjectNotFound {
			http.Error(w, `{"error": "Project not found"}`, http.StatusNotFound)
		} else {
			http.Error(w, `{"error": "Failed to update project"}`, http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dto.MapProjectToResponse(*project))
}
