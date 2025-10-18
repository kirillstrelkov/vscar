package com.vscar

import com.mongodb.ConnectionString
import com.mongodb.MongoClientSettings
import com.mongodb.kotlin.client.coroutine.MongoClient
import io.ktor.server.application.*
import org.bson.codecs.configuration.CodecRegistries
import org.bson.codecs.pojo.PojoCodecProvider

fun Application.connectToMongoDB(): com.mongodb.kotlin.client.coroutine.MongoDatabase {
  val config = environment.config
  val uri = config.property("mongodb.uri").getString()
  val databaseName = config.property("mongodb.db_name").getString()

  val pojoCodecProvider = PojoCodecProvider.builder().automatic(true).build()
  val codecRegistry =
    CodecRegistries.fromRegistries(
      MongoClientSettings.getDefaultCodecRegistry(),
      CodecRegistries.fromProviders(pojoCodecProvider),
    )

  val settings =
    MongoClientSettings.builder()
      .applyConnectionString(ConnectionString(uri))
      .codecRegistry(codecRegistry)
      .build()
  val mongoClient = MongoClient.create(settings)
  val database = mongoClient.getDatabase(databaseName)

  environment.monitor.subscribe(ApplicationStopped) { mongoClient.close() }

  return database
}
