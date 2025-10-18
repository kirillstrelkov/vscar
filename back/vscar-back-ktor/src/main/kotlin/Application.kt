package com.vscar

import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond

fun main(args: Array<String>) {
  io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
  val mongoDatabase = connectToMongoDB()
  val carService = CarService(mongoDatabase)

  install(ContentNegotiation) { json(kotlinx.serialization.json.Json { ignoreUnknownKeys = true }) }

  install(StatusPages) {

    // Catch general unhandled exceptions (critical errors)
    exception<Throwable> { call, cause ->
      call.application.log.error("An unexpected error occurred:", cause)

      call.respond(
        status = HttpStatusCode.InternalServerError,
        message = mapOf("error" to "An internal server error occurred."),
      )
    }
  }
  configureHTTP()
  configureSerialization()
  configureRouting(carService)
}
