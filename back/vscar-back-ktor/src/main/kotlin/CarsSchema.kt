package com.vscar

import com.mongodb.client.model.Aggregates
import com.mongodb.client.model.Facet
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Filters.*
import com.mongodb.client.model.Projections
import com.mongodb.client.model.Sorts
import com.mongodb.kotlin.client.coroutine.MongoCollection
import com.mongodb.kotlin.client.coroutine.MongoDatabase
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.toList
import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient
import kotlinx.serialization.json.JsonElement
import org.bson.conversions.Bson
import org.bson.types.ObjectId

@Serializable
data class Car(
  @SerialName("id") @Transient @Contextual val _id: ObjectId = ObjectId(),
  val name: String,
  val url: String,
  @SerialName("adac_id") val adacId: Long,
  @SerialName("processed_date") val processedDate: String,
  val image: String,
  val fuel: String,
  val transmission: String,
  val power: Int,
  val price: Int,
  val attributes: List<CarAttribute>,
)

@Serializable
data class CarAttribute(
  val name: String,
  @Contextual val value: JsonElement,
  @SerialName("column_data") val columnData: ColumnData,
)

@Serializable
data class ColumnData(
  val type: String,
  @SerialName("additional_values") val additionalValues: List<String?>,
  val range: Map<String, Float>,
)

@Serializable data class PaginatedResult(val data: List<Car>, val total: Long)

@Serializable
private data class CarAttributeProjection(
  @SerialName("adac_id") val adacId: Long,
  val attributes: List<CarAttribute>,
)

@Serializable
data class FilterQuery(
  val page: Int,
  val limit: Int? = 100, // Make it nullable/Optional compatible
  val text: String,
  val attributes: List<QueryAttr>,
)

@Serializable
data class QueryAttr(
  val name: String,
  val range: QueryRange? = null, // Using nullable type instead of Optional
  val values: List<String?> = emptyList(), // Use String? to handle null values
)

@Serializable
data class QueryRange(
  val min: Double? = null, // Using nullable types instead of Optional
  val max: Double? = null,
)

class CarService(database: MongoDatabase) {
  private val collection: MongoCollection<Car> = database.getCollection<Car>("cars")

  suspend fun findFirst(): Car {
    return collection.find().first()
  }

  suspend fun findOne(id: Long): Car {
    return collection.find(Filters.eq("adac_id", id)).first()
  }

  suspend fun findAll(): List<Car> {
    val cars = collection.find().limit(10).toList()
    return cars
  }

  suspend fun findNames(text: String): List<String> {
    val car = findFirst()
    val lowerCaseText = text.lowercase()

    return car.attributes
      .map { it.name }
      .filter { name ->
        val lowerCaseName = name.lowercase()
        lowerCaseName.contains(lowerCaseText) && !lowerCaseName.endsWith("fixed")
      }
      .distinct()
      .sorted()
  }

  data class StringValueProjection(
    val _id: String? // The grouped value from the aggregation will map to '_id'
  )

  suspend fun findValues(attributeName: String): Any {
    val filter: Bson = Filters.elemMatch("attributes", Filters.eq("name", attributeName))

    val projection: Bson =
      Projections.fields(Projections.include("adac_id"), Projections.include("attributes.$"))

    val metaDoc =
      collection
        .withDocumentClass<CarAttributeProjection>()
        .find(filter)
        .projection(projection)
        .first()

    if (metaDoc.attributes.isEmpty()) {
      return emptyList<String>()
    }

    val colData = metaDoc.attributes.first().columnData
    val attrType = colData.type

    return when (attrType) {
      "int",
      "float" -> {
        colData
      }

      "str" -> {
        val agg =
          listOf(
            Aggregates.unwind("\$attributes"),
            Aggregates.match(Filters.eq("attributes.name", attributeName)),
            Aggregates.project(
              Projections.fields(
                Projections.excludeId(),
                Projections.computed("value", "\$attributes.value"),
              )
            ),
            Aggregates.group("\$value"),
          )

        val results = collection.aggregate<StringValueProjection>(agg).toList()

        val uniqueValues = results.mapNotNull { it._id }.sorted()

        uniqueValues
      }

      else -> {
        throw IllegalStateException("Unsupported attribute type: $attrType")
      }
    }
  }

  suspend fun getProcessedDate(): String {
    val date = findFirst().processedDate
    return date.substringBefore('.')
  }

  suspend fun findByFilter(query: FilterQuery): PaginatedResult<Car> {

    // --- 1. Extract and Define Paging/Search Params ---
    val page = query.page
    val limit = query.limit ?: 100 // Kotlin elvis operator for default value
    val text = query.text

    // --- 2. Build the Main Filter (List of Criteria/Filters) ---
    val criterias = mutableListOf<Bson>()

    for (attr in query.attributes) {
      val attrCriteria = mutableListOf<Bson>()
      val key = attr.name

      // a. Range Filters (Numeric)
      val range = attr.range
      if (range != null && (range.min != null || range.max != null)) {

        // Build the elemMatch filter for the attribute
        var rangeForFixedAttr = Filters.eq("name", "$key|fixed")

        if (range.min != null) {
          // Combine with AND logic (gte)
          rangeForFixedAttr = Filters.and(rangeForFixedAttr, Filters.gte("value", range.min))
        }
        if (range.max != null) {
          // Combine with AND logic (lte)
          rangeForFixedAttr = Filters.and(rangeForFixedAttr, Filters.lte("value", range.max))
        }

        // Wrap the fixed attribute criteria in an elemMatch for the 'attributes' array
        val rangeCriteria = Filters.elemMatch("attributes", rangeForFixedAttr)
        attrCriteria.add(rangeCriteria)
      }

      // b. Value Filters (String IN list)
      if (attr.values.isNotEmpty()) {
        // Filter out nulls from the list of optional values
        val nonNullValues = attr.values.filterNotNull()

        if (nonNullValues.isNotEmpty()) {
          // Build the elemMatch filter for the specific attribute name and value IN list
          val elemMatchCriteria =
            Filters.and(Filters.eq("name", key), Filters.`in`("value", nonNullValues))

          val inCriteria = Filters.elemMatch("attributes", elemMatchCriteria)
          attrCriteria.add(inCriteria)
        }
      }

      // Apply OR operator if there are range OR value filters for this attribute
      if (attrCriteria.isNotEmpty()) {
        criterias.add(Filters.or(attrCriteria))
      }
    }

    // c. Text Search Filter
    if (text.isNotEmpty()) {
      // Regex for case-insensitive text search on the 'name' field
      val textCriteria = Filters.regex("name", text, "i")
      criterias.add(textCriteria)
    }

    // Combine all attribute and text filters with AND operator
    val finalMatchFilter: Bson =
      if (criterias.isEmpty()) {
        // Match all documents if no criteria are present
        Filters.empty()
      } else {
        Filters.and(criterias)
      }

    // --- 3. Build the Aggregation Pipeline ---

    val skip = ((page - 1) * limit)

    // Stages shared by both the count and result facets
    val matchStage: Bson = Aggregates.match(finalMatchFilter)
    val sortStage: Bson = Aggregates.sort(Sorts.ascending("price"))

    // Stages for Paginated Results Facet
    val pagedResultsPipeline: List<Bson> = listOf(Aggregates.skip(skip), Aggregates.limit(limit))

    // Stages for Total Count Facet
    val totalCountPipeline: List<Bson> =
      listOf(
        Aggregates.count("total") // The result field name will be 'total'
      )

    // Facet Stage (combines paged results and count in one aggregation)
    val facetStage: Bson =
      Aggregates.facet(
        Facet("paginatedResults", pagedResultsPipeline),
        Facet("totalCount", totalCountPipeline),
      )

    // The complete aggregation pipeline
    val aggregationPipeline = listOf(matchStage, sortStage, facetStage)

    // --- 4. Execute Aggregation and Process Result ---

    // Execute the aggregation, mapping the result to our FacetResult data class
    // We use .firstOrNull() because $facet always returns a list with exactly one document
    val facetResult = collection.aggregate<FacetResult>(aggregationPipeline).firstOrNull()

    // Handle the case where no documents match the initial criteria (result is null)
    if (facetResult == null) {
      return PaginatedResult(page, limit, 0, 0, skip, emptyList())
    }

    // --- 5. Build Final Paginated Result ---
    return buildPaginatedResult(page, limit, skip, facetResult)
  }

  private fun buildPaginatedResult(
    page: Int,
    limit: Int,
    offset: Int,
    facetResult: FacetResult,
  ): PaginatedResult<Car> {

    val docs = facetResult.paginatedResults

    // Total count is in a list of size 0 or 1. Access safely.
    val total = facetResult.totalCount.firstOrNull()?.total ?: 0

    // Calculate total pages
    val pages =
      if (total > 0) {
        // Kotlin handles floating point division and type conversion correctly
        kotlin.math.ceil(total.toDouble() / limit).toInt()
      } else 0

    return PaginatedResult(page, limit, total, pages, offset, docs)
  }

  @Serializable data class TotalCountData(val total: Int)

  @Serializable
  data class PaginatedResult<T>(
    val page: Int,
    val limit: Int,
    val total: Int,
    val pages: Int,
    val offset: Int,
    val docs: List<T>,
  )

  @Serializable
  data class FacetResult(
    val paginatedResults: List<Car> = emptyList(),
    val totalCount: List<TotalCountData> = emptyList(), // Expects a list with one item
  )
}
