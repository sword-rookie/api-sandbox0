package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
	"gorm.io/datatypes"
)

type CreateProjectRequest struct {
	Name            string         `json:"name" validate:"required"`
	Description     string         `json:"description"`
	BlueprintSchema datatypes.JSON `json:"blueprint_schema"`
}

type UpdateProjectRequest struct {
	Name            *string        `json:"name"`
	Description     *string        `json:"description"`
	BlueprintSchema datatypes.JSON `json:"blueprint_schema"`
	IsPinned        *bool          `json:"is_pinned"`
}

type ProjectResponse struct {
	ID              uuid.UUID      `json:"id"`
	Name            string         `json:"name"`
	Slug            string         `json:"slug"`
	Description     string         `json:"description"`
	Status          string         `json:"status"`
	BlueprintSchema datatypes.JSON `json:"blueprint_schema,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

func MapProjectToResponse(p models.Project) ProjectResponse {
	return ProjectResponse{
		ID:              p.ID,
		Name:            p.Name,
		Slug:            p.Slug,
		Description:     p.Description,
		Status:          p.Status,
		BlueprintSchema: p.BlueprintSchema,
		CreatedAt:       p.CreatedAt,
		UpdatedAt:       p.UpdatedAt,
	}
}

func MapProjectsToResponse(projects []models.Project) []ProjectResponse {
	var res []ProjectResponse
	for _, p := range projects {
		res = append(res, MapProjectToResponse(p))
	}
	return res
}
