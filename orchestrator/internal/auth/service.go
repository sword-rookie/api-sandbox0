package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net/mail"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/pquerna/otp/totp"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/config"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/dto"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/repository"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/security"
)

var (
	ErrInvalidEmail      = errors.New("invalid email address format")
	ErrPasswordTooWeak   = errors.New("password must be at least 8 characters long")
	ErrNameRequired      = errors.New("full name is required")
	ErrUsernameRequired  = errors.New("username is required")
)

type Service struct {
	repo repository.Repository
	cfg  *config.Config
}

func NewService(repo repository.Repository, cfg *config.Config) *Service {
	return &Service{repo: repo, cfg: cfg}
}

// Register validates user input, hashes the password, and saves the user record.
func (s *Service) Register(req *dto.RegisterRequest) (*dto.RegisterResponse, error) {
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	// Validation
	if req.Name == "" {
		return nil, ErrNameRequired
	}
	if _, err := mail.ParseAddress(req.Email); err != nil {
		return nil, ErrInvalidEmail
	}
	if len(req.Password) < 8 {
		return nil, ErrPasswordTooWeak
	}

	// Default username strategy (email prefix) if not provided initially
	defaultUsername := strings.Split(req.Email, "@")[0]

	// Check if user already exists
	existing, err := s.repo.GetUserByEmail(req.Email)
	if err == nil && existing != nil {
		return nil, repository.ErrUserAlreadyExists
	}

	// Hash password with Argon2id
	pwHash, err := security.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Generate UUID
	userID := uuid.New()

	now := time.Now().UTC()
	user := &models.User{
		ID:           userID,
		Name:         req.Name,
		Username:     defaultUsername,
		Email:        req.Email,
		PasswordHash: pwHash,
		LastIP:       "0.0.0.0",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	// Persist
	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	return &dto.RegisterResponse{
		ID:      user.ID.String(),
		Name:    user.Name,
		Email:   user.Email,
		Message: "Account created successfully",
	}, nil
}

func (s *Service) GetProfileByUsername(username string) (*dto.ProfileResponse, error) {
	user, err := s.repo.GetUserByUsername(username)
	if err != nil {
		return nil, err
	}
	return s.mapToProfileResponse(user), nil
}

func (s *Service) GetProfileByID(id string) (*dto.ProfileResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	user, err := s.repo.GetUserByID(uid)
	if err != nil {
		return nil, err
	}
	return s.mapToProfileResponse(user), nil
}

func (s *Service) UpdateProfile(id string, req *dto.UpdateProfileRequest) (*dto.ProfileResponse, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	user, err := s.repo.GetUserByID(uid)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.Name != "" {
		user.Name = strings.TrimSpace(req.Name)
	}
	if req.Username != "" {
		user.Username = strings.TrimSpace(req.Username)
	}
	if req.Email != "" {
		if _, err := mail.ParseAddress(req.Email); err != nil {
			return nil, ErrInvalidEmail
		}
		user.Email = strings.TrimSpace(strings.ToLower(req.Email))
	}
	if req.Bio != "" {
		user.Bio = req.Bio
	}
	if req.Location != "" {
		user.Location = req.Location
	}
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, err
	}

	return s.mapToProfileResponse(user), nil
}

func (s *Service) DeleteProfile(id string) error {
	uid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return s.repo.DeleteUser(uid)
}

func (s *Service) ForgotPassword(req *dto.ForgotPasswordRequest, ip, userAgent string) error {
	email := strings.TrimSpace(strings.ToLower(req.Email))
	if _, err := mail.ParseAddress(email); err != nil {
		return ErrInvalidEmail
	}

	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		log.Printf("ForgotPassword: User not found for email: %s", email)
		return nil // Generic success
	}

	// Generate 48-byte secure token
	rawTokenBytes := make([]byte, 48)
	if _, err := rand.Read(rawTokenBytes); err != nil {
		return err
	}
	rawToken := hex.EncodeToString(rawTokenBytes)

	// Hash token with Argon2id
	tokenHash, err := security.HashPassword(rawToken)
	if err != nil {
		return err
	}

	id := uuid.New()

	resetToken := &models.PasswordResetToken{
		ID:        id,
		UserID:    user.ID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().UTC().Add(30 * time.Minute),
		Used:      false,
		CreatedAt: time.Now().UTC(),
	}

	if err := s.repo.SavePasswordResetToken(resetToken); err != nil {
		return err
	}

	// Audit Log
	s.repo.CreateAuditLog(&models.AuditLog{
		ID:        id,
		UserID:    user.ID,
		Event:     "forgot_password_requested",
		Provider:  "local",
		IPAddress: ip,
		UserAgent: userAgent,
		CreatedAt: time.Now().UTC(),
	})

	fullToken := fmt.Sprintf("%s:%s", id.String(), rawToken)

	// Simulate sending email
	log.Printf("=====================================================")
	log.Printf("SIMULATED EMAIL TO: %s", user.Email)
	log.Printf("SUBJECT: Reset Your Clarity Machine Password")
	log.Printf("LINK: http://localhost:3000/reset-password?token=%s", fullToken)
	log.Printf("=====================================================")

	return nil
}

var ErrInvalidOrExpiredToken = errors.New("invalid or expired token")

func (s *Service) ValidateResetToken(fullToken string) error {
	parts := strings.Split(fullToken, ":")
	if len(parts) != 2 {
		return ErrInvalidOrExpiredToken
	}
	idStr, rawToken := parts[0], parts[1]
	id, err := uuid.Parse(idStr)
	if err != nil {
		return ErrInvalidOrExpiredToken
	}

	token, err := s.repo.GetPasswordResetToken(id)
	if err != nil || token.Used || token.ExpiresAt.Before(time.Now().UTC()) {
		return ErrInvalidOrExpiredToken
	}

	match, err := security.ComparePassword(rawToken, token.TokenHash)
	if err != nil || !match {
		return ErrInvalidOrExpiredToken
	}
	return nil
}

func (s *Service) ResetPassword(req *dto.ResetPasswordRequest, ip, userAgent string) error {
	if len(req.NewPassword) < 8 {
		return ErrPasswordTooWeak
	}

	parts := strings.Split(req.Token, ":")
	if len(parts) != 2 {
		return ErrInvalidOrExpiredToken
	}
	idStr, rawToken := parts[0], parts[1]
	id, err := uuid.Parse(idStr)
	if err != nil {
		return ErrInvalidOrExpiredToken
	}

	token, err := s.repo.GetPasswordResetToken(id)
	if err != nil || token.Used || token.ExpiresAt.Before(time.Now().UTC()) {
		return ErrInvalidOrExpiredToken
	}

	match, err := security.ComparePassword(rawToken, token.TokenHash)
	if err != nil || !match {
		return ErrInvalidOrExpiredToken
	}

	// Token is valid, hash new password
	pwHash, err := security.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	if err := s.repo.UpdateUserPassword(token.UserID, pwHash); err != nil {
		return err
	}

	s.repo.CreateAuditLog(&models.AuditLog{
		ID:        uuid.New(),
		UserID:    token.UserID,
		Event:     "password_reset_success",
		Provider:  "local",
		IPAddress: ip,
		UserAgent: userAgent,
		CreatedAt: time.Now().UTC(),
	})

	return s.repo.DeletePasswordResetToken(token.ID)
}

func (s *Service) mapToProfileResponse(user *models.User) *dto.ProfileResponse {
	return &dto.ProfileResponse{
		ID:        user.ID.String(),
		Name:      user.Name,
		Username:  user.Username,
		Email:     user.Email,
		Bio:       user.Bio,
		Location:  user.Location,
		AvatarURL: user.AvatarURL,
	}
}

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrMFARequired        = errors.New("mfa_required")
	ErrInvalidTOTP        = errors.New("invalid TOTP code")
)

func (s *Service) Login(req *dto.LoginRequest, ip, userAgent string) (*dto.LoginResponse, *models.User, error) {
	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, nil, ErrInvalidCredentials
		}
		return nil, nil, err
	}

	match, err := security.ComparePassword(req.Password, user.PasswordHash)
	if err != nil || !match {
		return nil, nil, ErrInvalidCredentials
	}

	if user.MFAEnabled {
		// Generate 5-minute temporary token for step 2
		tempToken, err := GenerateMFATempToken(user.ID.String())
		if err != nil {
			return nil, nil, err
		}
		return &dto.LoginResponse{
			RequiresMFA: true,
			TempToken:   tempToken,
		}, user, ErrMFARequired
	}

	// Log successful non-MFA login
	user.LastLogin = time.Now().UTC()
	user.LastIP = ip
	user.LastUserAgent = userAgent
	_ = s.repo.UpdateUser(user)

	audit := &models.AuditLog{
		ID:        uuid.New(),
		UserID:    user.ID,
		Event:     "login_success",
		Provider:  "local",
		IPAddress: ip,
		UserAgent: userAgent,
		CreatedAt: time.Now().UTC(),
	}
	_ = s.repo.CreateAuditLog(audit)

	return &dto.LoginResponse{RequiresMFA: false}, user, nil
}

func (s *Service) LoginMFA(req *dto.MFALoginRequest, userID uuid.UUID, ip, userAgent string) error {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return err
	}

	if !user.MFAEnabled {
		return errors.New("MFA is not enabled for this user")
	}

	secretBytes, err := security.Decrypt(user.MFASecret, s.cfg.EncryptionKey)
	if err != nil {
		return err
	}
	
	valid := totp.Validate(req.TOTPCode, string(secretBytes))
	if !valid {
		return ErrInvalidTOTP
	}

	user.LastLogin = time.Now().UTC()
	user.LastIP = ip
	user.LastUserAgent = userAgent
	_ = s.repo.UpdateUser(user)

	audit := &models.AuditLog{
		ID:        uuid.New(),
		UserID:    user.ID,
		Event:     "mfa_login_success",
		Provider:  "local",
		IPAddress: ip,
		UserAgent: userAgent,
		CreatedAt: time.Now().UTC(),
	}
	_ = s.repo.CreateAuditLog(audit)

	return nil
}

func (s *Service) GenerateMFA(userID uuid.UUID) (*dto.MFAGenerateResponse, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	if user.MFAEnabled {
		return nil, errors.New("MFA is already enabled")
	}

	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "ClarityMachine",
		AccountName: user.Email,
	})
	if err != nil {
		return nil, err
	}

	encryptedSecret, err := security.Encrypt([]byte(key.Secret()), s.cfg.EncryptionKey)
	if err != nil {
		return nil, err
	}

	user.MFASecret = encryptedSecret
	if err := s.repo.UpdateUser(user); err != nil {
		return nil, err
	}

	return &dto.MFAGenerateResponse{
		Secret: key.Secret(),
		URI:    key.URL(),
	}, nil
}

func (s *Service) VerifyMFA(userID uuid.UUID, req *dto.MFAVerifyRequest) error {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return err
	}
	if user.MFAEnabled {
		return errors.New("MFA is already enabled")
	}

	secretBytes, err := security.Decrypt(user.MFASecret, s.cfg.EncryptionKey)
	if err != nil {
		return err
	}
	
	valid := totp.Validate(req.TOTPCode, string(secretBytes))
	if !valid {
		return ErrInvalidTOTP
	}

	user.MFAEnabled = true
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}
	return nil
}
