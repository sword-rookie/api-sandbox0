package dto

import "time"

type DashboardStats struct {
	ActiveSandboxes int `json:"active_sandboxes"`
	Projects        int `json:"projects"`
	Issues          int `json:"issues"`
}

type ProjectPreview struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Domain       string    `json:"domain"`
	Status       string    `json:"status"` // HEALTHY, ISSUES, WARNING
	ActiveCount  int       `json:"active_count"`
	IssueCount   int       `json:"issue_count"`
	LastUpdated  time.Time `json:"last_updated"`
}

type SandboxPreview struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	ProjectName string    `json:"project_name"`
	Status      string    `json:"status"` // RUNNING, SLEEPING, ERROR, BUILDING
	LiveURL     string    `json:"live_url"`
	LastActive  time.Time `json:"last_active"`
}

type DashboardResponse struct {
	User struct {
		Name     string `json:"name"`
		Username string `json:"username"`
	} `json:"user"`
	Stats           DashboardStats    `json:"stats"`
	RecentProjects  []ProjectPreview  `json:"recent_projects"`
	ActiveSandboxes []SandboxPreview  `json:"active_sandboxes"`
}
