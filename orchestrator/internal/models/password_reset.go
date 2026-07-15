package models

import (
	"time"

	"github.com/google/uuid"
)

// PasswordResetToken represents a token used for the forgot password flow
type PasswordResetToken struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;index;not null"`
	TokenHash string    `json:"-" gorm:"unique;not null"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	Used      bool      `json:"used" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at" gorm:"not null"`
}
