package auth

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
	"github.com/google/uuid"
)

var (
	githubOauthConfig *oauth2.Config
	googleOauthConfig *oauth2.Config
)

func InitOAuth() {
	githubOauthConfig = &oauth2.Config{
		RedirectURL:  getEnvOrDefault("GITHUB_REDIRECT_URL", "http://localhost:8081/api/auth/github/callback"),
		ClientID:     getEnvOrDefault("GITHUB_CLIENT_ID", "mock-github-client-id"),
		ClientSecret: getEnvOrDefault("GITHUB_CLIENT_SECRET", "mock-github-client-secret"),
		Scopes:       []string{"read:user", "user:email"},
		Endpoint:     github.Endpoint,
	}

	googleOauthConfig = &oauth2.Config{
		RedirectURL:  getEnvOrDefault("GOOGLE_REDIRECT_URL", "http://localhost:8081/api/auth/google/callback"),
		ClientID:     getEnvOrDefault("GOOGLE_CLIENT_ID", "mock-google-client-id"),
		ClientSecret: getEnvOrDefault("GOOGLE_CLIENT_SECRET", "mock-google-client-secret"),
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
}

func (h *Handler) BeginOAuth(w http.ResponseWriter, r *http.Request) {
	provider := mux.Vars(r)["provider"]

	var conf *oauth2.Config
	if provider == "github" {
		conf = githubOauthConfig
	} else if provider == "google" {
		conf = googleOauthConfig
	} else {
		http.Error(w, "Invalid provider", http.StatusBadRequest)
		return
	}

	// Generate and sign state
	state, err := GenerateOAuthState()
	if err != nil {
		http.Error(w, "Failed to generate state", http.StatusInternalServerError)
		return
	}

	// Store state in short-lived secure cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		HttpOnly: true,
		Secure:   false, // Set true in production (HTTPS)
		SameSite: http.SameSiteLaxMode,
		Path:     "/api/auth",
		MaxAge:   5 * 60, // 5 mins
	})

	// Add PKCE (Proof Key for Code Exchange)
	verifierBytes := make([]byte, 32)
	rand.Read(verifierBytes)
	codeVerifier := base64.RawURLEncoding.EncodeToString(verifierBytes)
	
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_pkce_verifier",
		Value:    codeVerifier,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/api/auth",
		MaxAge:   5 * 60,
	})

	url := conf.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.SetAuthURLParam("code_challenge", oauth2.S256ChallengeFromVerifier(codeVerifier)), oauth2.SetAuthURLParam("code_challenge_method", "S256"))
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *Handler) OAuthCallback(w http.ResponseWriter, r *http.Request) {
	provider := mux.Vars(r)["provider"]
	state := r.FormValue("state")
	code := r.FormValue("code")

	// Validate State Cookie
	stateCookie, err := r.Cookie("oauth_state")
	if err != nil || stateCookie.Value != state || !ValidateStateProperly(stateCookie.Value) {
		http.Error(w, "Invalid or missing state (CSRF Protection)", http.StatusForbidden)
		return
	}

	// Validate PKCE
	pkceCookie, err := r.Cookie("oauth_pkce_verifier")
	if err != nil {
		http.Error(w, "Missing PKCE verifier", http.StatusForbidden)
		return
	}

	var conf *oauth2.Config
	var profileURL string
	if provider == "github" {
		conf = githubOauthConfig
		profileURL = "https://api.github.com/user"
	} else if provider == "google" {
		conf = googleOauthConfig
		profileURL = "https://www.googleapis.com/oauth2/v2/userinfo"
	} else {
		http.Error(w, "Invalid provider", http.StatusBadRequest)
		return
	}

	// Exchange code for token
	token, err := conf.Exchange(r.Context(), code, oauth2.SetAuthURLParam("code_verifier", pkceCookie.Value))
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch User Profile
	client := conf.Client(r.Context(), token)
	resp, err := client.Get(profileURL)
	if err != nil {
		http.Error(w, "Failed to get user profile", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var profile map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		http.Error(w, "Failed to parse user profile", http.StatusInternalServerError)
		return
	}

	// Extract email and ID based on provider
	var email, providerID, name, avatarURL string
	if provider == "github" {
		email = extractString(profile, "email")
		if email == "" {
			// GitHub might have email private, need to fetch emails endpoint
			emailsResp, err := client.Get("https://api.github.com/user/emails")
			if err == nil {
				defer emailsResp.Body.Close()
				var emails []map[string]interface{}
				if json.NewDecoder(emailsResp.Body).Decode(&emails) == nil {
					for _, e := range emails {
						if e["primary"].(bool) {
							email = e["email"].(string)
							break
						}
					}
				}
			}
		}
		providerID = fmt.Sprintf("%.0f", profile["id"].(float64))
		name = extractString(profile, "name")
		if name == "" {
			name = extractString(profile, "login")
		}
		avatarURL = extractString(profile, "avatar_url")
	} else if provider == "google" {
		email = extractString(profile, "email")
		providerID = extractString(profile, "id")
		name = extractString(profile, "name")
		avatarURL = extractString(profile, "picture")
	}

	if email == "" {
		http.Error(w, "Email not provided by OAuth provider", http.StatusBadRequest)
		return
	}

	// Check if user exists
	user, err := h.service.repo.GetUserByEmail(email)
	if err == nil && user != nil {
		// User exists. Check if provider matches.
		if user.Provider != provider {
			http.Redirect(w, r, "http://localhost:3000/login?error=account_exists_different_provider", http.StatusTemporaryRedirect)
			return
		}
		// Existing user login successful
	} else {
		// New User
		userID := uuid.New()
		user = &models.User{
			ID:            userID,
			Name:          name,
			Username:      strings.Split(email, "@")[0],
			Email:         email,
			PasswordHash:  "", // No password for OAuth users
			AvatarURL:     avatarURL,
			Provider:      provider,
			ProviderID:    providerID,
			EmailVerified: true,
			LastIP:        extractIP(r),
			LastUserAgent: r.UserAgent(),
			LastLogin:     time.Now().UTC(),
			CreatedAt:     time.Now().UTC(),
			UpdatedAt:     time.Now().UTC(),
		}
		if err := h.service.repo.CreateUser(user); err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
	}

	// Update last login
	user.LastLogin = time.Now().UTC()
	user.LastIP = extractIP(r)
	user.LastUserAgent = r.UserAgent()
	_ = h.service.repo.UpdateUser(user)

	// Create tokens
	accToken, refOpaque, refHash, err := GenerateTokens(user.ID.String())
	if err != nil {
		http.Error(w, "Failed to generate tokens", http.StatusInternalServerError)
		return
	}

	// Save refresh token to DB
	refModel := &models.RefreshToken{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: refHash,
		ExpiresAt: time.Now().UTC().Add(7 * 24 * time.Hour),
		Revoked:   false,
		CreatedAt: time.Now().UTC(),
	}
	_ = h.service.repo.SaveRefreshToken(refModel)

	// Audit Log
	audit := &models.AuditLog{
		ID:        uuid.New(),
		UserID:    user.ID,
		Event:     "oauth_login",
		Provider:  provider,
		IPAddress: extractIP(r),
		UserAgent: r.UserAgent(),
		CreatedAt: time.Now().UTC(),
	}
	_ = h.service.repo.CreateAuditLog(audit)

	// Set Cookies
	SetAuthCookies(w, accToken, refOpaque)

	// Clear OAuth State Cookies
	clearCookie(w, "oauth_state", "/api/auth")
	clearCookie(w, "oauth_pkce_verifier", "/api/auth")

	// Redirect to Dashboard
	http.Redirect(w, r, "http://localhost:3000/dashboard", http.StatusTemporaryRedirect)
}

func clearCookie(w http.ResponseWriter, name string, path string) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     path,
		MaxAge:   -1,
		HttpOnly: true,
	})
}

func extractString(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok {
		if s, ok := val.(string); ok {
			return s
		}
	}
	return ""
}

// getIP function removed in favor of extractIP in handler.go
