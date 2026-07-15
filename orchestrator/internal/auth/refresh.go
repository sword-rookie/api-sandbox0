package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
)

// RefreshToken handles rotating the access and refresh tokens.
func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "Refresh token missing", http.StatusUnauthorized)
		return
	}
	opaqueToken := cookie.Value

	// Hash the incoming token
	hash := sha256.Sum256([]byte(opaqueToken))
	tokenHash := hex.EncodeToString(hash[:])

	// Lookup in database
	refModel, err := h.service.repo.GetRefreshToken(tokenHash)
	if err != nil || refModel == nil {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	// Check if revoked or expired
	if refModel.Revoked {
		// Potential malicious activity: someone is trying to use a revoked token.
		// In a highly secure system, we might want to revoke ALL tokens for this user.
		http.Error(w, "Token revoked", http.StatusUnauthorized)
		return
	}
	if time.Now().UTC().After(refModel.ExpiresAt) {
		http.Error(w, "Token expired", http.StatusUnauthorized)
		return
	}

	// Token is valid. Rotate it (Single-use semantics).
	// Revoke old token
	_ = h.service.repo.RevokeRefreshToken(refModel.ID)

	// Issue new tokens
	accToken, newRefOpaque, newRefHash, err := GenerateTokens(refModel.UserID.String())
	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Save new refresh token
	newRefID := uuid.New()
	newRefModel := &models.RefreshToken{
		ID:        newRefID,
		UserID:    refModel.UserID,
		TokenHash: newRefHash,
		ExpiresAt: time.Now().UTC().Add(7 * 24 * time.Hour),
		Revoked:   false,
		CreatedAt: time.Now().UTC(),
	}
	_ = h.service.repo.SaveRefreshToken(newRefModel)

	// Audit Log
	audit := &models.AuditLog{
		ID:        uuid.New(),
		UserID:    refModel.UserID,
		Event:     "token_refresh",
		Provider:  "system",
		IPAddress: extractIP(r),
		UserAgent: r.UserAgent(),
		CreatedAt: time.Now().UTC(),
	}
	_ = h.service.repo.CreateAuditLog(audit)

	// Set new cookies
	SetAuthCookies(w, accToken, newRefOpaque)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Tokens refreshed successfully"))
}
