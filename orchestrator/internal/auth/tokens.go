package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	jwtSecret      = []byte(getEnvOrDefault("JWT_SECRET", "super-secret-jwt-key-replace-in-prod"))
	stateCookieKey = []byte(getEnvOrDefault("STATE_COOKIE_KEY", "state-cookie-secret-32bytes-min!"))
)

func GenerateTokens(userID string) (accessToken string, refreshTokenOpaque string, refreshTokenHash string, err error) {
	// 1. Generate Access Token (JWT)
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err = token.SignedString(jwtSecret)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to sign access token: %w", err)
	}

	// 2. Generate Refresh Token (Opaque)
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}
	refreshTokenOpaque = base64.URLEncoding.EncodeToString(b)

	// Hash the refresh token for storage
	hash := sha256.Sum256([]byte(refreshTokenOpaque))
	refreshTokenHash = hex.EncodeToString(hash[:])

	return accessToken, refreshTokenOpaque, refreshTokenHash, nil
}

// GenerateMFATempToken creates a short-lived, single-use JWT for the MFA step 2 verification
func GenerateMFATempToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(5 * time.Minute).Unix(),
		"iat": time.Now().Unix(),
		"typ": "mfa_temp",
		// TODO: Add 'jti' tracking to a Redis/DB blocklist to enforce true single-use
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken validates a JWT token and returns its claims
func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}

// GenerateOAuthState creates a secure, signed state string to prevent CSRF.
func GenerateOAuthState() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	rawState := base64.URLEncoding.EncodeToString(b)
	
	// Sign the state
	mac := hmac.New(sha256.New, stateCookieKey)
	mac.Write([]byte(rawState))
	signature := mac.Sum(nil)

	// Format: rawState.signature
	return fmt.Sprintf("%s.%s", rawState, base64.URLEncoding.EncodeToString(signature)), nil
}

// ValidateOAuthState checks if the state signature is valid.
func ValidateOAuthState(state string) bool {
	return ValidateStateProperly(state)
}

func ValidateStateProperly(state string) bool {
	parts := stringSplit(state, ".")
	if len(parts) != 2 {
		return false
	}
	rawState := parts[0]
	signatureStr := parts[1]

	sig, err := base64.URLEncoding.DecodeString(signatureStr)
	if err != nil {
		return false
	}

	mac := hmac.New(sha256.New, stateCookieKey)
	mac.Write([]byte(rawState))
	expectedSig := mac.Sum(nil)

	return hmac.Equal(sig, expectedSig)
}

func stringSplit(s, sep string) []string {
	var res []string
	for {
		i := -1
		for j := 0; j < len(s)-len(sep)+1; j++ {
			if s[j:j+len(sep)] == sep {
				i = j
				break
			}
		}
		if i == -1 {
			res = append(res, s)
			break
		}
		res = append(res, s[:i])
		s = s[i+len(sep):]
	}
	return res
}

func getEnvOrDefault(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func SetAuthCookies(w http.ResponseWriter, accessToken, refreshToken string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   15 * 60, // 15 minutes
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/api/auth/refresh",
		MaxAge:   7 * 24 * 60 * 60, // 7 days
	})
}

// ValidateAccessToken parses and validates a JWT string and returns the sub claim (userID)
func ValidateAccessToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		sub, ok := claims["sub"].(string)
		if !ok {
			return "", fmt.Errorf("sub claim is missing or not a string")
		}
		return sub, nil
	}

	return "", fmt.Errorf("invalid token")
}
