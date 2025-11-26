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

type CommentRepository struct {
	collection *mongo.Collection
}

func NewCommentRepository(db *mongo.Database) *CommentRepository {
	return &CommentRepository{
		collection: db.Collection("comments"),
	}
}

func (r *CommentRepository) Create(ctx context.Context, comment *models.Comment) error {
	comment.ID = primitive.NewObjectID()
	comment.CreatedAt = time.Now()
	comment.Deleted = false
	comment.LikesCount = 0

	_, err := r.collection.InsertOne(ctx, comment)
	return err
}

func (r *CommentRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Comment, error) {
	var comment models.Comment
	err := r.collection.FindOne(ctx, bson.M{"_id": id, "deleted": false}).Decode(&comment)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("comment not found")
		}
		return nil, err
	}
	return &comment, nil
}

func (r *CommentRepository) FindByPost(ctx context.Context, postID primitive.ObjectID, limit int) ([]*models.Comment, error) {
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, bson.M{"post_id": postID, "deleted": false, "parent_comment_id": nil}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var comments []*models.Comment
	if err = cursor.All(ctx, &comments); err != nil {
		return nil, err
	}

	return comments, nil
}

func (r *CommentRepository) FindByReel(ctx context.Context, reelID primitive.ObjectID, limit int) ([]*models.Comment, error) {
	opts := options.Find().
		SetLimit(int64(limit)).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, bson.M{"reel_id": reelID, "deleted": false, "parent_comment_id": nil}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var comments []*models.Comment
	if err = cursor.All(ctx, &comments); err != nil {
		return nil, err
	}

	return comments, nil
}

func (r *CommentRepository) FindReplies(ctx context.Context, parentID primitive.ObjectID) ([]*models.Comment, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}})

	cursor, err := r.collection.Find(ctx, bson.M{"parent_comment_id": parentID, "deleted": false}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var comments []*models.Comment
	if err = cursor.All(ctx, &comments); err != nil {
		return nil, err
	}

	return comments, nil
}

func (r *CommentRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"deleted": true}},
	)
	return err
}

func (r *CommentRepository) IncrementLikes(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": id},
		bson.M{"$inc": bson.M{"likes_count": 1}},
	)
	return err
}

func (r *CommentRepository) Count(ctx context.Context, filter bson.M) (int64, error) {
	return r.collection.CountDocuments(ctx, filter)
}
