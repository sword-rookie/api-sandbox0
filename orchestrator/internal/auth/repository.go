package auth

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	_ "github.com/glebarez/go-sqlite"
	"github.com/sword-rookie/api-sandbox0/orchestrator/internal/models"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user with this email or username already exists")
)

type UserRepository interface {
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByUsername(username string) (*models.User, error)
	GetUserByID(id string) (*models.User, error)
	UpdateUser(user *models.User) error
	DeleteUser(id string) error
	Close() error
}

type SQLiteRepository struct {
	db *sql.DB
}

// NewSQLiteRepository creates and initializes the SQLite database.
func NewSQLiteRepository(dbPath string) (*SQLiteRepository, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite db: %w", err)
	}

	// Create users table if not exists (with new profile fields)
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		username TEXT UNIQUE NOT NULL,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		bio TEXT,
		location TEXT,
		avatar_url TEXT,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	);
	CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
	CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
	`
	if _, err := db.Exec(query); err != nil {
		// If it fails, we might need a migration (adding columns to old schema)
		// For robustness in this sandbox, let's just attempt to add columns if they are missing
		_ = db.Exec(`ALTER TABLE users ADD COLUMN username TEXT UNIQUE DEFAULT ''`)
		_ = db.Exec(`ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''`)
		_ = db.Exec(`ALTER TABLE users ADD COLUMN location TEXT DEFAULT ''`)
		_ = db.Exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''`)
		_ = db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);`)
	}

	return &SQLiteRepository{db: db}, nil
}

func (r *SQLiteRepository) CreateUser(user *models.User) error {
	query := `INSERT INTO users (id, name, username, email, password_hash, bio, location, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.Exec(query, user.ID, user.Name, user.Username, user.Email, user.PasswordHash, user.Bio, user.Location, user.AvatarURL, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create user (possibly duplicate email or username): %w", err)
	}
	return nil
}

func (r *SQLiteRepository) GetUserByEmail(email string) (*models.User, error) {
	query := `SELECT id, name, username, email, password_hash, bio, location, avatar_url, created_at, updated_at FROM users WHERE email = ?`
	return r.scanUser(r.db.QueryRow(query, email))
}

func (r *SQLiteRepository) GetUserByUsername(username string) (*models.User, error) {
	query := `SELECT id, name, username, email, password_hash, bio, location, avatar_url, created_at, updated_at FROM users WHERE username = ?`
	return r.scanUser(r.db.QueryRow(query, username))
}

func (r *SQLiteRepository) GetUserByID(id string) (*models.User, error) {
	query := `SELECT id, name, username, email, password_hash, bio, location, avatar_url, created_at, updated_at FROM users WHERE id = ?`
	return r.scanUser(r.db.QueryRow(query, id))
}

func (r *SQLiteRepository) UpdateUser(user *models.User) error {
	query := `UPDATE users SET name = ?, username = ?, email = ?, bio = ?, location = ?, avatar_url = ?, updated_at = ? WHERE id = ?`
	res, err := r.db.Exec(query, user.Name, user.Username, user.Email, user.Bio, user.Location, user.AvatarURL, time.Now().UTC(), user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (r *SQLiteRepository) DeleteUser(id string) error {
	query := `DELETE FROM users WHERE id = ?`
	res, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (r *SQLiteRepository) Close() error {
	return r.db.Close()
}

func (r *SQLiteRepository) scanUser(row *sql.Row) (*models.User, error) {
	var u models.User
	var createdAtStr, updatedAtStr string
	// Handle NULL values from old rows using sql.NullString
	var bio, loc, ava, user sql.NullString

	err := row.Scan(&u.ID, &u.Name, &user, &u.Email, &u.PasswordHash, &bio, &loc, &ava, &createdAtStr, &updatedAtStr)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	u.Username = user.String
	u.Bio = bio.String
	u.Location = loc.String
	u.AvatarURL = ava.String

	// Parse timestamps
	u.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	if u.CreatedAt.IsZero() {
		u.CreatedAt, _ = time.Parse("2006-01-02 15:04:05.999999999-07:00", createdAtStr)
	}
	u.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
	if u.UpdatedAt.IsZero() {
		u.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05.999999999-07:00", updatedAtStr)
	}

	return &u, nil
}
