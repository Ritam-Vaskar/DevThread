package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidToken     = errors.New("invalid token")
	ErrExpiredToken     = errors.New("token expired")
	ErrInvalidCredentials = errors.New("invalid credentials")
)

type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	IsAdmin  bool   `json:"is_admin"`
	jwt.StandardClaims
}

type Service struct {
	jwtSecret        string
	accessExpiry     time.Duration
	refreshExpiry    time.Duration
}

func NewService(jwtSecret string, accessExpiry, refreshExpiry time.Duration) *Service {
	return &Service{
		jwtSecret:     jwtSecret,
		accessExpiry:  accessExpiry,
		refreshExpiry: refreshExpiry,
	}
}

// HashPassword creates a bcrypt hash of the password
func (s *Service) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword compares a password with its hash
func (s *Service) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateAccessToken creates a new JWT access token
func (s *Service) GenerateAccessToken(userID, username string, isAdmin bool) (string, error) {
	claims := &Claims{
		UserID:   userID,
		Username: username,
		IsAdmin:  isAdmin,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(s.accessExpiry).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

// GenerateRefreshToken creates a secure random refresh token
func (s *Service) GenerateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// ValidateAccessToken validates and parses a JWT access token
func (s *Service) ValidateAccessToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

// GetUserFromContext retrieves user information from context
func GetUserFromContext(ctx context.Context) (*Claims, error) {
	claims, ok := ctx.Value("user").(*Claims)
	if !ok {
		return nil, errors.New("user not found in context")
	}
	return claims, nil
}

// GetGithubOAuthURL generates GitHub OAuth URL
func (s *Service) GetGithubOAuthURL(clientID, redirectURL string) string {
	return fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email",
		clientID,
		redirectURL,
	)
}
