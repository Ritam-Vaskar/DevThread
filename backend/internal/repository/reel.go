package repository

import (
	"context"
	"errors"
	"time"

	"github.com/devthreads/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ReelRepository struct {
	collection *mongo.Collection
}

func NewReelRepository(db *mongo.Database) *ReelRepository {
	return &ReelRepository{
		collection: db.Collection("reels"),
	}
}

func (r *ReelRepository) Create(ctx context.Context, reel *models.Reel) error {
	reel.ID = primitive.NewObjectID()
	reel.CreatedAt = time.Now()
	reel.UpdatedAt = time.Now()
	reel.Deleted = false
	reel.LikesCount = 0
	reel.CommentsCount = 0
	reel.ViewsCount = 0

	_, err := r.collection.InsertOne(ctx, reel)
	return err
}

func (r *ReelRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Reel, error) {
	var reel models.Reel
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "deleted": false}).Decode(&reel)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("reel not found")
		}
		return nil, err
	}
	return &reel, nil
}

func (r *ReelRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"deleted": true, "updated_at": time.Now()}},
	)
	return err
}

func (r *ReelRepository) IncrementCount(ctx context.Context, id primitive.ObjectID, field string) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$inc": bson.M{field: 1}},
	)
	return err
}

func (r *ReelRepository) List(ctx context.Context, limit int, skip int) ([]*models.Reel, error) {
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	filter := bson.M{"deleted": false, "visibility": "PUBLIC"}
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var reels []*models.Reel
	if err = cursor.All(ctx, &reels); err != nil {
		return nil, err
	}

	return reels, nil
}

func (r *ReelRepository) FindByAuthor(ctx context.Context, authorID primitive.ObjectID, limit int) ([]*models.Reel, error) {
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, bson.M{"author_id": authorID, "deleted": false}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var reels []*models.Reel
	if err = cursor.All(ctx, &reels); err != nil {
		return nil, err
	}

	return reels, nil
}

func (r *ReelRepository) Trending(ctx context.Context, limit int) ([]*models.Reel, error) {
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSort(bson.D{
			{Key: "likes_count", Value: -1},
			{Key: "views_count", Value: -1},
		})

	filter := bson.M{"deleted": false, "visibility": "PUBLIC"}
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var reels []*models.Reel
	if err = cursor.All(ctx, &reels); err != nil {
		return nil, err
	}

	return reels, nil
}

func (r *ReelRepository) Count(ctx context.Context, filter bson.M) (int64, error) {
	return r.collection.CountDocuments(ctx, filter)
}
