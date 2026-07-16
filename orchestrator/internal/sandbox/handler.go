package sandbox

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/auth"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) GetSandboxes(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("access_token")
	if err != nil {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userIDStr, err := auth.ValidateAccessToken(cookie.Value)
	if err != nil {
		http.Error(w, `{"error": "invalid token"}`, http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, `{"error": "invalid user id format"}`, http.StatusBadRequest)
		return
	}

	sandboxes, err := h.service.GetSandboxes(userID)
	if err != nil {
		http.Error(w, `{"error": "failed to fetch sandboxes"}`, http.StatusInternalServerError)
		return
	}

	if sandboxes == nil {
		sandboxes = []models.Sandbox{} // Ensure empty array [] is returned instead of null
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sandboxes)
}
