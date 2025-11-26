package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	Client *mongo.Client
	DB     *mongo.Database
}

func Connect(ctx context.Context, uri string) (*Database, error) {
	clientOptions := options.Client().ApplyURI(uri)
	clientOptions.SetMaxPoolSize(50)
	clientOptions.SetMinPoolSize(10)
	clientOptions.SetMaxConnIdleTime(30 * time.Second)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Ping the database
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	// Get database name from URI or use default
	dbName := "devthreads"
	if clientOptions.Auth != nil && clientOptions.Auth.AuthSource != "" {
		dbName = clientOptions.Auth.AuthSource
	}

	return &Database{
		Client: client,
		DB:     client.Database(dbName),
	}, nil
}

func (d *Database) Disconnect(ctx context.Context) error {
	return d.Client.Disconnect(ctx)
}

func (d *Database) Collection(name string) *mongo.Collection {
	return d.DB.Collection(name)
}
