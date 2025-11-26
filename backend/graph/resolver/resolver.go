package resolver

import (
	"github.com/devthreads/backend/config"
	"github.com/devthreads/backend/internal/auth"
	"github.com/devthreads/backend/internal/database"
	"github.com/devthreads/backend/internal/repository"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB          *database.Database
	AuthService *auth.Service
	Config      *config.Config

	// Repositories
	UserRepo       *repository.UserRepository
	PostRepo       *repository.PostRepository
	ReelRepo       *repository.ReelRepository
	CommentRepo    *repository.CommentRepository
	EngagementRepo *repository.EngagementRepository
}

func NewResolver(db *database.Database, authService *auth.Service, cfg *config.Config) *Resolver {
	return &Resolver{
		DB:             db,
		AuthService:    authService,
		Config:         cfg,
		UserRepo:       repository.NewUserRepository(db.DB),
		PostRepo:       repository.NewPostRepository(db.DB),
		ReelRepo:       repository.NewReelRepository(db.DB),
		CommentRepo:    repository.NewCommentRepository(db.DB),
		EngagementRepo: repository.NewEngagementRepository(db.DB),
	}
}
