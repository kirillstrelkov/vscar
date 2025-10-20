package config

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"os"
	"time"
)

type Config struct {
	Port     string
	Env      string
	MongoURI string
}

func LoadConfig() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // default port
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development" // default environment
	}

	mongoURI := os.Getenv("DATABASE_URI")
	if mongoURI == "" {
		log.Println("DATABASE_URI not set, defaulting to mongodb://localhost:27017")
		mongoURI = "mongodb://localhost:27017"
	}

	return Config{
		Port:     port,
		Env:      env,
		MongoURI: mongoURI,
	}
}

// NewMongoClient connects to MongoDB and returns a client ready to use.
func NewMongoClient(mongoURI string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	clientOpts := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, err
	}
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}
	return client, nil
}
