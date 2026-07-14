package auth

import (
	"crypto/rand"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/dto"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/security"
)

var (
	ErrInvalidEmail      = errors.New("invalid email address format")
	ErrPasswordTooWeak   = errors.New("password must be at least 8 characters long")
	ErrNameRequired      = errors.New("full name is required")
	ErrUsernameRequired  = errors.New("username is required")
)

type Service struct {
	repo UserRepository
}

func NewService(repo UserRepository) *Service {
	return &Service{repo: repo}
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
		return nil, ErrUserAlreadyExists
	}

	// Hash password with Argon2id
	pwHash, err := security.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Generate UUID
	userID, err := generateUUID()
	if err != nil {
		return nil, fmt.Errorf("failed to generate user ID: %w", err)
	}

	now := time.Now().UTC()
	user := &models.User{
		ID:           userID,
		Name:         req.Name,
		Username:     defaultUsername,
		Email:        req.Email,
		PasswordHash: pwHash,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	// Persist
	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	return &dto.RegisterResponse{
		ID:      user.ID,
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
	user, err := s.repo.GetUserByID(id)
	if err != nil {
		return nil, err
	}
	return s.mapToProfileResponse(user), nil
}

func (s *Service) UpdateProfile(id string, req *dto.UpdateProfileRequest) (*dto.ProfileResponse, error) {
	user, err := s.repo.GetUserByID(id)
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
	return s.repo.DeleteUser(id)
}

func (s *Service) mapToProfileResponse(user *models.User) *dto.ProfileResponse {
	return &dto.ProfileResponse{
		ID:        user.ID,
		Name:      user.Name,
		Username:  user.Username,
		Email:     user.Email,
		Bio:       user.Bio,
		Location:  user.Location,
		AvatarURL: user.AvatarURL,
	}
}

func generateUUID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:]), nil
}
