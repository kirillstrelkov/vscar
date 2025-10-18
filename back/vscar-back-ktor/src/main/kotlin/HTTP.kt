package com.vscar

import com.mongodb.client.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.config.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.swagger.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureHTTP() {
  routing { swaggerUI(path = "openapi") }
  install(CORS) {
    allowHost("localhost:4200", schemes = listOf("http"))

    allowMethod(HttpMethod.Post)
    allowMethod(HttpMethod.Get)
    allowMethod(HttpMethod.Options)

    allowHeader(HttpHeaders.ContentType)

    maxAgeInSeconds = 3600
  }
}
