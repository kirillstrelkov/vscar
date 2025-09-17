package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"vscar-back-gin/src/config"
	"vscar-back-gin/src/routes"
)

func main() {
	_ = godotenv.Load()
	cfg := config.LoadConfig()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	client, err := config.NewMongoClient(cfg.MongoURI)
	if err != nil {
		panic(err)
	}

	routes.SetupRoutes(r, client)

	r.Run(":" + cfg.Port)
}
