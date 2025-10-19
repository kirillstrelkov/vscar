import org.gradle.api.JavaVersion

plugins {
  alias(libs.plugins.kotlin.jvm)
  alias(libs.plugins.ktor)
  alias(libs.plugins.kotlin.plugin.serialization)
  id("com.diffplug.spotless") version "8.0.0"
}

group = "com.vscar"

version = "0.0.1"

application { mainClass = "io.ktor.server.netty.EngineMain" }

dependencies {
  implementation(libs.ktor.server.core)
  implementation(libs.ktor.server.swagger)
  implementation(libs.ktor.server.cors)
  implementation(libs.ktor.serialization.kotlinx.json)
  implementation(libs.ktor.server.content.negotiation)

  implementation("io.ktor:ktor-server-status-pages")

  // mongo
  implementation("org.mongodb:bson-kotlinx")
  implementation(platform("org.mongodb:mongodb-driver-bom:5.6.1"))
  implementation("org.mongodb:mongodb-driver-kotlin-coroutine")

  implementation(libs.bson)
  implementation(libs.ktor.server.netty)
  implementation(libs.logback.classic)
  implementation(libs.ktor.server.config.yaml)
  testImplementation(libs.ktor.server.test.host)
  testImplementation(libs.kotlin.test.junit)
}

spotless {
  kotlin {
    target("**/*.kt", "**/*.kts")

    ktfmt().googleStyle()

    trimTrailingWhitespace()
    endWithNewline()
  }
}

ktor { docker { jreVersion.set(JavaVersion.VERSION_21) } }

jib { from { image = "eclipse-temurin:21-jre-alpine" } }
