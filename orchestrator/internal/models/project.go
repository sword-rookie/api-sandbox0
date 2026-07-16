package models

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID      uuid.UUID  `json:"user_id" gorm:"index"`
	Name        string     `json:"name" gorm:"not null"`
	Slug        string     `json:"slug" gorm:"unique;not null"`
	Description string     `json:"description"`
	Status      string     `json:"status" gorm:"default:active"`
	IsPinned    bool       `json:"is_pinned" gorm:"default:false"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Sandboxes   []Sandbox  `json:"sandboxes" gorm:"foreignKey:ProjectID"`
}
