package com.vscar

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.carRoutes(carService: CarService) {
  route("/cars") {
    post("/findByFilter") {
      val query = call.receive<FilterQuery>()
      val result = carService.findByFilter(query)
      call.respond(result)
    }

    get("/{id}") {
      val id =
        call.parameters["id"]?.toLongOrNull()
          ?: throw IllegalArgumentException("Car ID must be a number")
      carService.findOne(id).let { car -> call.respond(car) }
    }

    get { call.respond(carService.findAll()) }

    get("/attributes/names") {
      val text = call.request.queryParameters["text"].orEmpty()
      call.respond(carService.findNames(text))
    }

    get("/attributes/values") {
      val text = call.request.queryParameters["text"].orEmpty()
      call.respond(carService.findValues(text))
    }

    get("/db/version") { call.respondText(carService.getProcessedDate()) }
  }
}
