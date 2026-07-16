package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort string `env:"APP_PORT" default:"8081"`

	// Database
	DBType     string `env:"DB_TYPE" default:"postgres"`
	DBHost     string `env:"DB_HOST" default:"localhost"`
	DBPort     string `env:"DB_PORT" default:"5432"`
	DBUser     string `env:"DB_USER" default:"postgres"`
	DBPassword string `env:"DB_PASSWORD"`
	DBName     string `env:"DB_NAME" default:"clarity"`
	DBSSLMode  string `env:"DB_SSL_MODE" default:"prefer"`

	JWTSecret      string `env:"JWT_SECRET"`
	EncryptionKey  string `env:"ENCRYPTION_KEY"`
	StateCookieKey string `env:"STATE_COOKIE_KEY"`
}

func Load() *Config {
	godotenv.Load("../.env") // Load from root workspace if running in orchestrator
	godotenv.Load(".env")       // Load from CWD

	jwtSecret := getEnv("JWT_SECRET", "")
	encryptionKey := getEnv("ENCRYPTION_KEY", "")
	stateCookieKey := getEnv("STATE_COOKIE_KEY", "")

	if jwtSecret == "" || jwtSecret == "super-secret-jwt-key-replace-in-prod" {
		panic("JWT_SECRET environment variable is missing or using unsafe default!")
	}
	if encryptionKey == "" || encryptionKey == "12345678901234567890123456789012" {
		panic("ENCRYPTION_KEY environment variable is missing or using unsafe default!")
	}
	if stateCookieKey == "" || stateCookieKey == "state-cookie-secret-32bytes-min!" {
		panic("STATE_COOKIE_KEY environment variable is missing or using unsafe default!")
	}

	return &Config{
		AppPort:        getEnv("APP_PORT", "8081"),
		DBType:         getEnv("DB_TYPE", "postgres"),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "clarity"),
		DBSSLMode:      getEnv("DB_SSL_MODE", "prefer"),
		JWTSecret:      jwtSecret,
		EncryptionKey:  encryptionKey,
		StateCookieKey: stateCookieKey,
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
