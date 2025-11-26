package resolver

// THIS CODE IS A STARTING POINT ONLY. IT WILL NOT BE UPDATED WITH SCHEMA CHANGES.

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/devthreads/backend/graph/model"
	"github.com/devthreads/backend/internal/auth"
	"github.com/devthreads/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type mutationResolver struct{ *Resolver }

func (r *Resolver) Mutation() MutationResolver {
	return &mutationResolver{r}
}

// Signup creates a new user account
func (r *mutationResolver) Signup(ctx context.Context, input model.SignupInput) (*model.AuthPayload, error) {
	// Check if user already exists
	existingUser, _ := r.UserRepo.FindByEmail(ctx, input.Email)
	if existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}

	existingUser, _ = r.UserRepo.FindByUsername(ctx, input.Username)
	if existingUser != nil {
		return nil, errors.New("username already taken")
	}

	// Hash password
	hashedPassword, err := r.AuthService.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Username:    input.Username,
		Email:       input.Email,
		Password:    hashedPassword,
		DisplayName: *input.DisplayName,
		Reputation:  0,
		IsAdmin:     false,
	}

	if err := r.UserRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// Generate tokens
	accessToken, err := r.AuthService.GenerateAccessToken(user.ID.Hex(), user.Username, user.IsAdmin)
	if err != nil {
		return nil, err
	}

	refreshToken, err := r.AuthService.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	// Store refresh token (simplified - should be stored in DB)
	// TODO: Store in refresh_tokens collection

	return &model.AuthPayload{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         convertUser(user),
	}, nil
}

// Login authenticates a user
func (r *mutationResolver) Login(ctx context.Context, input model.LoginInput) (*model.AuthPayload, error) {
	// Find user
	user, err := r.UserRepo.FindByEmail(ctx, input.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check password
	if !r.AuthService.CheckPassword(input.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	// Check if banned
	if user.BannedUntil != nil && user.BannedUntil.After(time.Now()) {
		return nil, fmt.Errorf("account is banned until %s", user.BannedUntil.Format("2006-01-02 15:04:05"))
	}

	// Generate tokens
	accessToken, err := r.AuthService.GenerateAccessToken(user.ID.Hex(), user.Username, user.IsAdmin)
	if err != nil {
		return nil, err
	}

	refreshToken, err := r.AuthService.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	return &model.AuthPayload{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         convertUser(user),
	}, nil
}

// LoginWithGithub authenticates using GitHub OAuth
func (r *mutationResolver) LoginWithGithub(ctx context.Context, code string) (*model.AuthPayload, error) {
	// Exchange code for access token
	tokenURL := "https://github.com/login/oauth/access_token"
	data := map[string]string{
		"client_id":     r.Config.GithubClientID,
		"client_secret": r.Config.GithubClientSecret,
		"code":          code,
	}

	jsonData, _ := json.Marshal(data)
	req, _ := http.NewRequest("POST", tokenURL, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}

	body, _ := io.ReadAll(resp.Body)
	json.Unmarshal(body, &tokenResp)

	// Get user info from GitHub
	userReq, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
	userReq.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)

	userResp, err := client.Do(userReq)
	if err != nil {
		return nil, err
	}
	defer userResp.Close()

	var githubUser struct {
		ID        int    `json:"id"`
		Login     string `json:"login"`
		Email     string `json:"email"`
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
	}

	json.NewDecoder(userResp.Body).Decode(&githubUser)

	// Find or create user
	githubID := fmt.Sprintf("%d", githubUser.ID)
	user, err := r.UserRepo.FindByGithubID(ctx, githubID)

	if user == nil {
		// Create new user
		user = &models.User{
			Username:    githubUser.Login,
			Email:       githubUser.Email,
			DisplayName: githubUser.Name,
			AvatarURL:   githubUser.AvatarURL,
			GithubID:    githubID,
			Reputation:  0,
			IsAdmin:     false,
		}

		if err := r.UserRepo.Create(ctx, user); err != nil {
			return nil, err
		}
	}

	// Generate tokens
	accessToken, err := r.AuthService.GenerateAccessToken(user.ID.Hex(), user.Username, user.IsAdmin)
	if err != nil {
		return nil, err
	}

	refreshToken, err := r.AuthService.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	return &model.AuthPayload{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         convertUser(user),
	}, nil
}

// RefreshToken generates a new access token
func (r *mutationResolver) RefreshToken(ctx context.Context, refreshToken string) (*model.AuthPayload, error) {
	// TODO: Validate refresh token from database
	// For now, this is a simplified implementation

	return nil, errors.New("refresh token functionality not fully implemented")
}

// Logout invalidates the refresh token
func (r *mutationResolver) Logout(ctx context.Context) (bool, error) {
	// TODO: Invalidate refresh token in database
	return true, nil
}

// Helper function to convert models.User to model.User
func convertUser(u *models.User) *model.User {
	return &model.User{
		ID:          u.ID.Hex(),
		Username:    u.Username,
		DisplayName: &u.DisplayName,
		Email:       u.Email,
		AvatarURL:   &u.AvatarURL,
		Bio:         &u.Bio,
		Reputation:  u.Reputation,
		IsAdmin:     u.IsAdmin,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
	}
}

// GetCloudinarySignature generates a signature for Cloudinary uploads
func (r *mutationResolver) GetCloudinarySignature(ctx context.Context, folder string) (*model.CloudinarySignature, error) {
	timestamp := time.Now().Unix()

	// Create signature
	signStr := fmt.Sprintf("folder=%s&timestamp=%d%s", folder, timestamp, r.Config.CloudinaryAPISecret)
	hash := sha256.Sum256([]byte(signStr))
	signature := hex.EncodeToString(hash[:])

	return &model.CloudinarySignature{
		Signature: signature,
		Timestamp: int(timestamp),
		CloudName: r.Config.CloudinaryCloudName,
		APIKey:    r.Config.CloudinaryAPIKey,
		Folder:    folder,
	}, nil
}

// CreatePost creates a new post
func (r *mutationResolver) CreatePost(ctx context.Context, input model.CreatePostInput) (*model.Post, error) {
	claims, err := auth.GetUserFromContext(ctx)
	if err != nil {
		return nil, errors.New("unauthorized")
	}

	authorID, _ := primitive.ObjectIDFromHex(claims.UserID)

	visibility := "PUBLIC"
	if input.Visibility != nil {
		visibility = input.Visibility.String()
	}

	post := &models.Post{
		AuthorID:    authorID,
		Content:     input.Content,
		CodeSnippet: *input.CodeSnippet,
		Language:    *input.Language,
		Tags:        input.Tags,
		Visibility:  visibility,
	}

	if err := r.PostRepo.Create(ctx, post); err != nil {
		return nil, err
	}

	// Award reputation points
	r.UserRepo.UpdateReputation(ctx, authorID, 5)

	return convertPost(post), nil
}

// Helper to convert models.Post to model.Post
func convertPost(p *models.Post) *model.Post {
	return &model.Post{
		ID:            p.ID.Hex(),
		Content:       p.Content,
		CodeSnippet:   &p.CodeSnippet,
		Language:      &p.Language,
		Tags:          p.Tags,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
		LikesCount:    p.LikesCount,
		CommentsCount: p.CommentsCount,
		ViewsCount:    p.ViewsCount,
		UpvotesCount:  p.UpvotesCount,
	}
}

// MutationResolver interface (will be generated)
type MutationResolver interface {
	Signup(ctx context.Context, input model.SignupInput) (*model.AuthPayload, error)
	Login(ctx context.Context, input model.LoginInput) (*model.AuthPayload, error)
	LoginWithGithub(ctx context.Context, code string) (*model.AuthPayload, error)
	RefreshToken(ctx context.Context, refreshToken string) (*model.AuthPayload, error)
	Logout(ctx context.Context) (bool, error)
}
