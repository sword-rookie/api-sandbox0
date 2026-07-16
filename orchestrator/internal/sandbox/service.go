package sandbox

import (
	"github.com/google/uuid"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/repository"
)

type Service struct {
	repo repository.Repository
}

func NewService(repo repository.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) GetSandboxes(userID uuid.UUID) ([]models.Sandbox, error) {
	return s.repo.GetSandboxesByUserID(userID)
}
