package routes

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"vscar-back-gin/src/controllers"
)

func SetupRoutes(router *gin.Engine, client *mongo.Client) {
	controller := controllers.NewCarsController(client)

	router.GET("/", controller.Index)
	router.GET("/cars/db/version", controller.DbVersion)
	router.GET("/cars", controller.GetCars)
	router.GET("/cars/:id", controller.GetCar)
	router.GET("/cars/attributes/names", controller.FindNames)
	router.GET("/cars/attributes/values", controller.FindValues)
	router.POST("/cars/findByFilter", controller.FindByFilter)
}
