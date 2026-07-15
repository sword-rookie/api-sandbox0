package repository

import (
	"github.com/google/uuid"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
)

type Repository interface {
	// User Methods
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByUsername(username string) (*models.User, error)
	GetUserByID(id uuid.UUID) (*models.User, error)
	UpdateUser(user *models.User) error
	DeleteUser(id uuid.UUID) error
	UpdateUserPassword(userID uuid.UUID, passwordHash string) error

	// Refresh Token Methods
	SaveRefreshToken(token *models.RefreshToken) error
	GetRefreshToken(tokenHash string) (*models.RefreshToken, error)
	RevokeRefreshToken(id uuid.UUID) error

	// Audit Log
	CreateAuditLog(log *models.AuditLog) error

	// Password Reset Methods
	SavePasswordResetToken(token *models.PasswordResetToken) error
	GetPasswordResetToken(id uuid.UUID) (*models.PasswordResetToken, error)
	DeletePasswordResetToken(id uuid.UUID) error

	Close() error
}
