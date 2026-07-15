package repository

import (
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/google/uuid"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/config"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user with this email or username already exists")
)

type PostgresRepo struct {
	DB *gorm.DB
}

func NewPostgresRepo(cfg *config.Config) (*PostgresRepo, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode)

	logLevel := logger.Silent
	if os.Getenv("ENV") != "production" {
		logLevel = logger.Info
	}

	var db *gorm.DB
	var err error
	
	// Retry connection for up to 30 seconds
	for i := 0; i < 30; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logLevel),
			NowFunc: func() time.Time { return time.Now().UTC() },
		})
		if err == nil {
			break
		}
		log.Printf("Waiting for database connection... (%d/30)", i+1)
		time.Sleep(1 * time.Second)
	}
	
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database after retries: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	migrateURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBSSLMode)

	// Run explicit golang-migrate migrations
	if err := runMigrations(migrateURL); err != nil {
		log.Printf("Warning: schema migrations failed: %v", err)
	}

	return &PostgresRepo{DB: db}, nil
}

func runMigrations(migrateURL string) error {
	m, err := migrate.New(
		"file://migrations",
		migrateURL,
	)
	if err != nil {
		return fmt.Errorf("failed to initialize migrate: %w", err)
	}
	defer m.Close()

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrate up: %w", err)
	}
	log.Println("Database schema migrations applied successfully")
	return nil
}

func (r *PostgresRepo) CreateUser(user *models.User) error {
	result := r.DB.Create(user)
	if result.Error != nil {
		if isDuplicateKeyError(result.Error) {
			return ErrUserAlreadyExists
		}
		return result.Error
	}
	return nil
}

func (r *PostgresRepo) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	result := r.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, result.Error
	}
	return &user, nil
}

func (r *PostgresRepo) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	result := r.DB.Where("username = ?", username).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, result.Error
	}
	return &user, nil
}

func (r *PostgresRepo) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	result := r.DB.First(&user, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, result.Error
	}
	return &user, nil
}

func (r *PostgresRepo) UpdateUser(user *models.User) error {
	result := r.DB.Save(user)
	if result.Error != nil {
		if isDuplicateKeyError(result.Error) {
			return ErrUserAlreadyExists
		}
		return result.Error
	}
	return nil
}

func (r *PostgresRepo) DeleteUser(id uuid.UUID) error {
	result := r.DB.Delete(&models.User{}, "id = ?", id)
	return result.Error
}

func (r *PostgresRepo) UpdateUserPassword(userID uuid.UUID, passwordHash string) error {
	result := r.DB.Model(&models.User{}).Where("id = ?", userID).Update("password_hash", passwordHash)
	return result.Error
}

func (r *PostgresRepo) SaveRefreshToken(token *models.RefreshToken) error {
	result := r.DB.Create(token)
	return result.Error
}

func (r *PostgresRepo) GetRefreshToken(tokenHash string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	result := r.DB.Where("token_hash = ?", tokenHash).First(&token)
	if result.Error != nil {
		return nil, result.Error
	}
	return &token, nil
}

func (r *PostgresRepo) RevokeRefreshToken(id uuid.UUID) error {
	result := r.DB.Model(&models.RefreshToken{}).Where("id = ?", id).Update("revoked", true)
	return result.Error
}

func (r *PostgresRepo) CreateAuditLog(log *models.AuditLog) error {
	result := r.DB.Create(log)
	return result.Error
}

func (r *PostgresRepo) SavePasswordResetToken(token *models.PasswordResetToken) error {
	result := r.DB.Create(token)
	return result.Error
}

func (r *PostgresRepo) GetPasswordResetToken(id uuid.UUID) (*models.PasswordResetToken, error) {
	var token models.PasswordResetToken
	result := r.DB.First(&token, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &token, nil
}

func (r *PostgresRepo) DeletePasswordResetToken(id uuid.UUID) error {
	result := r.DB.Where("id = ?", id).Delete(&models.PasswordResetToken{})
	return result.Error
}

func (r *PostgresRepo) Close() error {
	sqlDB, err := r.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func isDuplicateKeyError(err error) bool {
	// A basic check for PostgreSQL duplicate key error (code 23505)
	return err != nil && (errors.Is(err, gorm.ErrDuplicatedKey) || err.Error() == "ERROR: duplicate key value violates unique constraint (SQLSTATE 23505)")
}
