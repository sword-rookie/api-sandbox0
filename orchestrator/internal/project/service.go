package project

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/dto"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
)

var (
	ErrProjectNotFound = errors.New("project not found")
)

type Repository interface {
	CreateProject(project *models.Project) error
	GetProjectsByUserID(userID uuid.UUID) ([]models.Project, error)
	CreateSandbox(sandbox *models.Sandbox) error
	GetSandboxesByUserID(userID uuid.UUID) ([]models.Sandbox, error)
}

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateProject(userID uuid.UUID, req *dto.CreateProjectRequest) (*models.Project, error) {
	// Generate a simple slug
	slug := strings.ToLower(strings.ReplaceAll(req.Name, " ", "-")) + "-" + uuid.New().String()[:8]

	project := &models.Project{
		UserID:      userID,
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Status:      "active",
	}

	err := s.repo.CreateProject(project)
	if err != nil {
		return nil, err
	}

	return project, nil
}

func (s *Service) GetProjectsByUserID(userID uuid.UUID) ([]models.Project, error) {
	return s.repo.GetProjectsByUserID(userID)
}

func (s *Service) GetSandboxesByUserID(userID uuid.UUID) ([]models.Sandbox, error) {
	return s.repo.GetSandboxesByUserID(userID)
}
