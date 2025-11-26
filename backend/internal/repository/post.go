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

type PostRepository struct {
	collection *mongo.Collection
}

func NewPostRepository(db *mongo.Database) *PostRepository {
	return &PostRepository{
		collection: db.Collection("posts"),
	}
}

func (r *PostRepository) Create(ctx context.Context, post *models.Post) error {
	post.ID = primitive.NewObjectID()
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	post.Deleted = false
	post.LikesCount = 0
	post.CommentsCount = 0
	post.ViewsCount = 0
	post.UpvotesCount = 0

	_, err := r.collection.InsertOne(ctx, post)
	return err
}

func (r *PostRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Post, error) {
	var post models.Post
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "deleted": false}).Decode(&post)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("post not found")
		}
		return nil, err
	}
	return &post, nil
}

func (r *PostRepository) Update(ctx context.Context, id primitive.ObjectID, update bson.M) error {
	update["updated_at"] = time.Now()
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	return err
}

func (r *PostRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	return r.Update(ctx, id, bson.M{"deleted": true})
}

func (r *PostRepository) IncrementCount(ctx context.Context, id primitive.ObjectID, field string) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$inc": bson.M{field: 1}},
	)
	return err
}

func (r *PostRepository) DecrementCount(ctx context.Context, id primitive.ObjectID, field string) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$inc": bson.M{field: -1}},
	)
	return err
}

func (r *PostRepository) Feed(ctx context.Context, filter string, limit int, skip int) ([]*models.Post, error) {
	var sortField bson.D
	findFilter := bson.M{"deleted": false, "visibility": "PUBLIC"}

	switch filter {
	case "TRENDING":
		// Sort by engagement score (likes + comments + upvotes)
		sortField = bson.D{
			{Key: "likes_count", Value: -1},
			{Key: "upvotes_count", Value: -1},
			{Key: "comments_count", Value: -1},
		}
	default: // LATEST
		sortField = bson.D{{Key: "created_at", Value: -1}}
	}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(sortField)

	cursor, err := r.collection.Find(ctx, findFilter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var posts []*models.Post
	if err = cursor.All(ctx, &posts); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *PostRepository) FindByAuthor(ctx context.Context, authorID primitive.ObjectID, limit int) ([]*models.Post, error) {
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, bson.M{"author_id": authorID, "deleted": false}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var posts []*models.Post
	if err = cursor.All(ctx, &posts); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *PostRepository) Search(ctx context.Context, query string, limit int) ([]*models.Post, error) {
	filter := bson.M{
		"deleted": false,
		"visibility": "PUBLIC",
		"$or": []bson.M{
			{"content": bson.M{"$regex": query, "$options": "i"}},
			{"tags": bson.M{"$in": []string{query}}},
		},
	}

	opts := options.Find().
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var posts []*models.Post
	if err = cursor.All(ctx, &posts); err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *PostRepository) Count(ctx context.Context, filter bson.M) (int64, error) {
	return r.collection.CountDocuments(ctx, filter)
}

func (r *PostRepository) List(ctx context.Context, limit int, skip int) ([]*models.Post, error) {
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSkip(int64(skip)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var posts []*models.Post
	if err = cursor.All(ctx, &posts); err != nil {
		return nil, err
	}

	return posts, nil
}
