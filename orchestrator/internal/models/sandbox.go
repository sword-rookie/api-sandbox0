package models

import (
	"time"

	"github.com/google/uuid"
)

type Sandbox struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	ProjectID    *uuid.UUID `json:"project_id"`
	UserID       uuid.UUID  `json:"user_id" gorm:"index"`
	Name         string     `json:"name" gorm:"not null"`
	GithubRepo   string     `json:"github_repo"`
	GithubBranch string     `json:"github_branch"`
	Status       string     `json:"status" gorm:"default:pending"`
	LiveURL      string     `json:"live_url"`
	LastActiveAt *time.Time `json:"last_active_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
