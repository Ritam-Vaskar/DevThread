package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a user in the system
type User struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username    string             `bson:"username" json:"username"`
	DisplayName string             `bson:"display_name,omitempty" json:"displayName"`
	Email       string             `bson:"email" json:"email"`
	Password    string             `bson:"password,omitempty" json:"-"`
	AvatarURL   string             `bson:"avatar_url,omitempty" json:"avatarUrl"`
	Bio         string             `bson:"bio,omitempty" json:"bio"`
	Reputation  int                `bson:"reputation" json:"reputation"`
	IsAdmin     bool               `bson:"is_admin" json:"isAdmin"`
	BannedUntil *time.Time         `bson:"banned_until,omitempty" json:"bannedUntil"`
	GithubID    string             `bson:"github_id,omitempty" json:"-"`
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}

// Post represents a microblog post
type Post struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	AuthorID     primitive.ObjectID `bson:"author_id" json:"authorId"`
	Content      string             `bson:"content" json:"content"`
	CodeSnippet  string             `bson:"code_snippet,omitempty" json:"codeSnippet"`
	Language     string             `bson:"language,omitempty" json:"language"`
	Tags         []string           `bson:"tags,omitempty" json:"tags"`
	Visibility   string             `bson:"visibility" json:"visibility"`
	LikesCount   int                `bson:"likes_count" json:"likesCount"`
	CommentsCount int               `bson:"comments_count" json:"commentsCount"`
	ViewsCount   int                `bson:"views_count" json:"viewsCount"`
	UpvotesCount int                `bson:"upvotes_count" json:"upvotesCount"`
	Deleted      bool               `bson:"deleted" json:"deleted"`
	CreatedAt    time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updatedAt"`
}

// Reel represents a short video post
type Reel struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	AuthorID      primitive.ObjectID `bson:"author_id" json:"authorId"`
	Title         string             `bson:"title,omitempty" json:"title"`
	Description   string             `bson:"description,omitempty" json:"description"`
	VideoURL      string             `bson:"video_url" json:"videoUrl"`
	ThumbnailURL  string             `bson:"thumbnail_url,omitempty" json:"thumbnailUrl"`
	Duration      int                `bson:"duration" json:"duration"`
	Tags          []string           `bson:"tags,omitempty" json:"tags"`
	Visibility    string             `bson:"visibility" json:"visibility"`
	LikesCount    int                `bson:"likes_count" json:"likesCount"`
	CommentsCount int                `bson:"comments_count" json:"commentsCount"`
	ViewsCount    int                `bson:"views_count" json:"viewsCount"`
	Deleted       bool               `bson:"deleted" json:"deleted"`
	CreatedAt     time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updatedAt"`
}

// Comment represents a comment on a post or reel
type Comment struct {
	ID              primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	AuthorID        primitive.ObjectID  `bson:"author_id" json:"authorId"`
	Content         string              `bson:"content" json:"content"`
	PostID          *primitive.ObjectID `bson:"post_id,omitempty" json:"postId"`
	ReelID          *primitive.ObjectID `bson:"reel_id,omitempty" json:"reelId"`
	ParentCommentID *primitive.ObjectID `bson:"parent_comment_id,omitempty" json:"parentCommentId"`
	LikesCount      int                 `bson:"likes_count" json:"likesCount"`
	Deleted         bool                `bson:"deleted" json:"deleted"`
	CreatedAt       time.Time           `bson:"created_at" json:"createdAt"`
}

// Engagement represents user interactions (likes, views, upvotes)
type Engagement struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID     primitive.ObjectID `bson:"user_id" json:"userId"`
	TargetType string             `bson:"target_type" json:"targetType"` // POST, REEL, COMMENT
	TargetID   primitive.ObjectID `bson:"target_id" json:"targetId"`
	Type       string             `bson:"type" json:"type"` // LIKE, VIEW, UPVOTE
	CreatedAt  time.Time          `bson:"created_at" json:"createdAt"`
}

// RefreshToken represents a refresh token
type RefreshToken struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"userId"`
	Token     string             `bson:"token" json:"token"`
	ExpiresAt time.Time          `bson:"expires_at" json:"expiresAt"`
	Revoked   bool               `bson:"revoked" json:"revoked"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
}

// Badge represents a user achievement badge
type Badge struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"userId"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	Icon        string             `bson:"icon" json:"icon"`
	EarnedAt    time.Time          `bson:"earned_at" json:"earnedAt"`
}

// Notification represents a user notification
type Notification struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID  `bson:"user_id" json:"userId"`
	Type      string              `bson:"type" json:"type"`
	Content   string              `bson:"content" json:"content"`
	RelatedID *primitive.ObjectID `bson:"related_id,omitempty" json:"relatedId"`
	Read      bool                `bson:"read" json:"read"`
	CreatedAt time.Time           `bson:"created_at" json:"createdAt"`
}

// ModerationLog represents admin moderation actions
type ModerationLog struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	AdminID    primitive.ObjectID `bson:"admin_id" json:"adminId"`
	Action     string             `bson:"action" json:"action"`
	TargetType string             `bson:"target_type" json:"targetType"`
	TargetID   primitive.ObjectID `bson:"target_id" json:"targetId"`
	Reason     string             `bson:"reason,omitempty" json:"reason"`
	CreatedAt  time.Time          `bson:"created_at" json:"createdAt"`
}
