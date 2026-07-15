package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/gorilla/mux"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/dto"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/repository"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body payload", http.StatusBadRequest)
		return
	}

	resp, err := h.service.Register(&req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case errors.Is(err, ErrNameRequired), errors.Is(err, ErrInvalidEmail), errors.Is(err, ErrPasswordTooWeak):
			w.WriteHeader(http.StatusBadRequest)
		case errors.Is(err, repository.ErrUserAlreadyExists):
			w.WriteHeader(http.StatusConflict)
		default:
			w.WriteHeader(http.StatusInternalServerError)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ip := extractIP(r)
	userAgent := r.UserAgent()

	resp, user, err := h.service.Login(&req, ip, userAgent)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if errors.Is(err, ErrMFARequired) {
			w.WriteHeader(http.StatusAccepted) // 202 for step 2 required
			json.NewEncoder(w).Encode(resp)
			return
		}
		if errors.Is(err, ErrInvalidCredentials) {
			w.WriteHeader(http.StatusUnauthorized)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Login Success (No MFA)
	accToken, refOpaque, refHash, err := GenerateTokens(user.ID.String())
	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Save Refresh Token
	refModel := &models.RefreshToken{
		ID:        uuid.New(), 
		UserID:    user.ID,
		TokenHash: refHash,
		ExpiresAt: time.Now().UTC().Add(7 * 24 * time.Hour),
		Revoked:   false,
		CreatedAt: time.Now().UTC(),
	}
	_ = h.service.repo.SaveRefreshToken(refModel)

	SetAuthCookies(w, accToken, refOpaque)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

func (h *Handler) LoginMFA(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req dto.MFALoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate Temp Token
	claims, err := ValidateToken(req.TempToken)
	if err != nil {
		http.Error(w, "Invalid temporary token", http.StatusUnauthorized)
		return
	}

	// Ensure this is an MFA temp token, not a standard access token
	if typ, ok := claims["typ"].(string); !ok || typ != "mfa_temp" {
		http.Error(w, "Invalid token type", http.StatusUnauthorized)
		return
	}

	userIDStr, ok := claims["sub"].(string)
	if !ok {
		http.Error(w, "Invalid token subject", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusUnauthorized)
		return
	}

	ip := extractIP(r)
	userAgent := r.UserAgent()

	err = h.service.LoginMFA(&req, userID, ip, userAgent)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if errors.Is(err, ErrInvalidTOTP) {
			w.WriteHeader(http.StatusUnauthorized)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	accToken, refOpaque, refHash, err := GenerateTokens(userID.String())
	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	refModel := &models.RefreshToken{
		ID:        uuid.New(),
		UserID:    userID,
		TokenHash: refHash,
		ExpiresAt: time.Now().UTC().Add(7 * 24 * time.Hour),
		Revoked:   false,
		CreatedAt: time.Now().UTC(),
	}
	_ = h.service.repo.SaveRefreshToken(refModel)

	SetAuthCookies(w, accToken, refOpaque)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "MFA login successful"})
}

func (h *Handler) GenerateMFA(w http.ResponseWriter, r *http.Request) {
	// For demo purposes, we will expect the user ID in header or query.
	// In production, extract this from the Auth JWT Middleware!
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	resp, err := h.service.GenerateMFA(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

func (h *Handler) VerifyMFA(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.Header.Get("X-User-ID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req dto.MFAVerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.VerifyMFA(userID, &req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "MFA enabled successfully"})
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	// Clear the access token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
	})

	// Clear the refresh token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("access_token")
	if err != nil {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := ValidateAccessToken(cookie.Value)
	if err != nil {
		http.Error(w, `{"error": "invalid token"}`, http.StatusUnauthorized)
		return
	}

	profile, err := h.service.GetProfileByID(userID)
	if err != nil {
		http.Error(w, `{"error": "user not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	profile, err := h.service.GetProfileByUsername(username)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if errors.Is(err, repository.ErrUserNotFound) {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Profile not found"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (h *Handler) UpdateProfileMe(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("access_token")
	if err != nil {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := ValidateAccessToken(cookie.Value)
	if err != nil {
		http.Error(w, `{"error": "invalid token"}`, http.StatusUnauthorized)
		return
	}

	var req dto.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body payload", http.StatusBadRequest)
		return
	}

	profile, err := h.service.UpdateProfile(userID, &req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if errors.Is(err, repository.ErrUserAlreadyExists) {
			w.WriteHeader(http.StatusConflict)
		} else if errors.Is(err, repository.ErrUserNotFound) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			w.WriteHeader(http.StatusBadRequest)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func (h *Handler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"] // In a real app, verify this matches the authenticated user ID

	err := h.service.DeleteProfile(id)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if errors.Is(err, repository.ErrUserNotFound) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Account successfully deleted"})
}

func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req dto.ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body payload", http.StatusBadRequest)
		return
	}

	ip := extractIP(r)
	userAgent := r.UserAgent()

	err := h.service.ForgotPassword(&req, ip, userAgent)
	if err != nil && err != ErrInvalidEmail {
		// Log internal errors but do not expose to user
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Always return success to prevent email enumeration
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "If an account exists with this email, a reset link has been sent."})
}

func (h *Handler) ValidateResetToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Token is required", http.StatusBadRequest)
		return
	}

	if err := h.service.ValidateResetToken(token); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid or expired token"})
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req dto.ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body payload", http.StatusBadRequest)
		return
	}

	ip := extractIP(r)
	userAgent := r.UserAgent()

	err := h.service.ResetPassword(&req, ip, userAgent)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if errors.Is(err, ErrInvalidOrExpiredToken) || errors.Is(err, ErrPasswordTooWeak) {
			w.WriteHeader(http.StatusBadRequest)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Password has been successfully reset"})
}

func extractIP(r *http.Request) string {
	ipStr := r.Header.Get("X-Forwarded-For")
	if ipStr != "" {
		ipStr = strings.Split(ipStr, ",")[0]
		ipStr = strings.TrimSpace(ipStr)
	} else {
		ipStr = r.RemoteAddr
	}

	host, _, err := net.SplitHostPort(ipStr)
	if err == nil {
		ipStr = host
	}

	parsedIP := net.ParseIP(ipStr)
	if parsedIP == nil {
		return "0.0.0.0"
	}
	return parsedIP.String()
}

func (h *Handler) UploadAvatar(w http.ResponseWriter, r *http.Request) {
	// 5MB limit
	r.ParseMultipartForm(5 << 20)
	
	file, header, err := r.FormFile("avatar")
	if err != nil {
		http.Error(w, `{"error": "Failed to get avatar file"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate type
	contentType := header.Header.Get("Content-Type")
	if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/webp" {
		http.Error(w, `{"error": "Invalid file type. Only JPEG, PNG, and WebP are allowed"}`, http.StatusBadRequest)
		return
	}

	// Create unique filename
	ext := filepath.Ext(header.Filename)
	newFilename := uuid.New().String() + ext
	savePath := filepath.Join("uploads", "avatars", newFilename)

	// Save file
	dst, err := os.Create(savePath)
	if err != nil {
		http.Error(w, `{"error": "Failed to save file"}`, http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, `{"error": "Failed to save file"}`, http.StatusInternalServerError)
		return
	}

	// Construct URL
	// Note: In production, read base URL from config or headers
	url := fmt.Sprintf("http://localhost:8081/uploads/avatars/%s", newFilename)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"url": url})
}

func (h *Handler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("access_token")
	if err != nil {
		http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
		return
	}

	userID, err := ValidateAccessToken(cookie.Value)
	if err != nil {
		http.Error(w, `{"error": "invalid token"}`, http.StatusUnauthorized)
		return
	}

	user, err := h.service.GetProfileByID(userID)
	if err != nil {
		http.Error(w, `{"error": "user not found"}`, http.StatusNotFound)
		return
	}

	resp := dto.DashboardResponse{}
	resp.User.Name = user.Name
	resp.User.Username = user.Username

	// Hardcoded stats
	resp.Stats = dto.DashboardStats{
		ActiveSandboxes: 5,
		Projects:        3,
		Issues:          2,
	}

	// Hardcoded recent projects
	resp.RecentProjects = []dto.ProjectPreview{
		{
			ID:          "p1",
			Name:        "Project Alpha",
			Domain:      "alpha-production.infra",
			Status:      "HEALTHY",
			ActiveCount: 12,
			IssueCount:  0,
			LastUpdated: time.Now().Add(-2 * time.Minute),
		},
		{
			ID:          "p2",
			Name:        "Beta Service",
			Domain:      "beta-service.test",
			Status:      "ISSUES",
			ActiveCount: 5,
			IssueCount:  2,
			LastUpdated: time.Now().Add(-14 * time.Hour),
		},
		{
			ID:          "p3",
			Name:        "Delta Analytics",
			Domain:      "delta-v3.analytics",
			Status:      "HEALTHY",
			ActiveCount: 3,
			IssueCount:  0,
			LastUpdated: time.Now().Add(-48 * time.Hour),
		},
	}

	// Hardcoded active sandboxes
	resp.ActiveSandboxes = []dto.SandboxPreview{
		{
			ID:          "s1",
			Name:        "auth-v2-dev",
			ProjectName: "Project Alpha",
			Status:      "RUNNING",
			LiveURL:     "auth-v2.clarity.dev",
			LastActive:  time.Now(),
		},
		{
			ID:          "s2",
			Name:        "payment-gate-test",
			ProjectName: "Beta Service",
			Status:      "SLEEPING",
			LiveURL:     "pay-test.clarity.dev",
			LastActive:  time.Now().Add(-45 * time.Minute),
		},
		{
			ID:          "s3",
			Name:        "worker-node-4",
			ProjectName: "Project Alpha",
			Status:      "BUILDING",
			LiveURL:     "",
			LastActive:  time.Now().Add(-2 * time.Minute),
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}
