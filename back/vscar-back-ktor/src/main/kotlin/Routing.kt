package com.vscar

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting(carService: CarService) {
  routing {
    get("/") { call.respondText("Hello World!") }
    carRoutes(carService)
  }
}
