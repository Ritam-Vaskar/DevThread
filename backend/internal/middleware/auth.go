package middleware

import (
	"context"
	"strings"

	"github.com/devthreads/backend/internal/auth"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware extracts and validates JWT tokens
func AuthMiddleware(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		// Allow requests without auth (some queries are public)
		if authHeader == "" {
			c.Next()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		token := parts[1]
		claims, err := authService.ValidateAccessToken(token)
		if err != nil {
			// Invalid token, but don't block - just don't set user context
			c.Next()
			return
		}

		// Add user claims to context
		ctx := context.WithValue(c.Request.Context(), "user", claims)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

// RequireAuth ensures user is authenticated
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := auth.GetUserFromContext(c.Request.Context())
		if err != nil {
			c.JSON(401, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireAdmin ensures user is an admin
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, err := auth.GetUserFromContext(c.Request.Context())
		if err != nil || !claims.IsAdmin {
			c.JSON(403, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}
		c.Next()
	}
}
