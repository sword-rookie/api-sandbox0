package models

import (
	"time"

	"github.com/google/uuid"
)

// AuditLog represents a security-relevant event
type AuditLog struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;index;not null"`
	Event     string    `json:"event" gorm:"not null"`
	Provider  string    `json:"provider" gorm:"not null"`
	IPAddress string    `json:"ip_address" gorm:"not null"`
	UserAgent string    `json:"user_agent" gorm:"not null"`
	CreatedAt time.Time `json:"created_at" gorm:"not null"`
}
