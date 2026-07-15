package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a registered developer on the platform.
type User struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name          string         `json:"name" gorm:"not null"`
	Username      string         `json:"username" gorm:"unique;not null;index"`
	Email         string         `json:"email" gorm:"unique;not null;index"`
	PasswordHash  string         `json:"-" gorm:"not null"`
	Bio           string         `json:"bio"`
	Location      string         `json:"location"`
	AvatarURL     string         `json:"avatar_url"`
	Provider      string         `json:"provider" gorm:"default:local"`
	ProviderID    string         `json:"provider_id"`
	EmailVerified bool           `json:"email_verified" gorm:"default:false"`
	MFAEnabled    bool           `json:"mfa_enabled" gorm:"default:false"`
	MFASecret     []byte         `json:"-"`
	LastLogin     time.Time      `json:"last_login"`
	LastIP        string         `json:"last_ip"`
	LastUserAgent string         `json:"last_user_agent"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}
