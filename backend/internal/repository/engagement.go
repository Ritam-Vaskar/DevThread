package repository

import (
	"context"
	"time"

	"github.com/devthreads/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type EngagementRepository struct {
	collection *mongo.Collection
}

func NewEngagementRepository(db *mongo.Database) *EngagementRepository {
	return &EngagementRepository{
		collection: db.Collection("engagements"),
	}
}

func (r *EngagementRepository) Create(ctx context.Context, engagement *models.Engagement) error {
	engagement.ID = primitive.NewObjectID()
	engagement.CreatedAt = time.Now()

	_, err := r.collection.InsertOne(ctx, engagement)
	return err
}

func (r *EngagementRepository) Exists(ctx context.Context, userID, targetID primitive.ObjectID, targetType, engagementType string) (bool, error) {
	filter := bson.M{
		"user_id":     userID,
		"target_id":   targetID,
		"target_type": targetType,
		"type":        engagementType,
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *EngagementRepository) Delete(ctx context.Context, userID, targetID primitive.ObjectID, targetType, engagementType string) error {
	filter := bson.M{
		"user_id":     userID,
		"target_id":   targetID,
		"target_type": targetType,
		"type":        engagementType,
	}

	_, err := r.collection.DeleteOne(ctx, filter)
	return err
}

func (r *EngagementRepository) Count(ctx context.Context, filter bson.M) (int64, error) {
	return r.collection.CountDocuments(ctx, filter)
}
