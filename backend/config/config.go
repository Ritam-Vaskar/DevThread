package config

import (
	"os"
	"time"
)

type Config struct {
	// Server
	Port        string
	Environment string

	// Database
	MongoURI      string
	MongoDatabase string

	// JWT
	JWTSecret        string
	JWTAccessExpiry  time.Duration
	JWTRefreshExpiry time.Duration

	// GitHub OAuth
	GithubClientID     string
	GithubClientSecret string
	GithubRedirectURL  string

	// Cloudinary
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string

	// Frontend
	FrontendURL string

	// Redis (optional)
	RedisURL string

	// Rate Limiting
	RateLimitRequests int
	RateLimitDuration time.Duration
}

func Load() *Config {
	return &Config{
		Port:                getEnv("PORT", "8080"),
		Environment:         getEnv("ENV", "development"),
		MongoURI:            getEnv("MONGODB_URI", "mongodb://localhost:27017/devthreads"),
		MongoDatabase:       getEnv("MONGODB_DATABASE", "devthreads"),
		JWTSecret:           getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		JWTAccessExpiry:     parseDuration(getEnv("JWT_ACCESS_EXPIRY", "15m")),
		JWTRefreshExpiry:    parseDuration(getEnv("JWT_REFRESH_EXPIRY", "168h")),
		GithubClientID:      getEnv("GITHUB_CLIENT_ID", ""),
		GithubClientSecret:  getEnv("GITHUB_CLIENT_SECRET", ""),
		GithubRedirectURL:   getEnv("GITHUB_REDIRECT_URL", "http://localhost:8080/auth/github/callback"),
		CloudinaryCloudName: getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret: getEnv("CLOUDINARY_API_SECRET", ""),
		FrontendURL:         getEnv("FRONTEND_URL", "http://localhost:3000"),
		RedisURL:            getEnv("REDIS_URL", ""),
		RateLimitRequests:   100,
		RateLimitDuration:   time.Minute,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 15 * time.Minute
	}
	return d
}
