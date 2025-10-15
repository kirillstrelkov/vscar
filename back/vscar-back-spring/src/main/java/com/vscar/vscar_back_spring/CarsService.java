/* (C) 2025 */
package com.vscar.vscar_back_spring;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.group;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.match;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.project;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.unwind;

import com.vscar.vscar_back_spring.dto.AttributeMetadata;
import com.vscar.vscar_back_spring.dto.Car;
import com.vscar.vscar_back_spring.dto.Car.ColumnData;
import com.vscar.vscar_back_spring.dto.FilterQuery;
import com.vscar.vscar_back_spring.dto.FilterQuery.QueryAttr;
import com.vscar.vscar_back_spring.dto.FilterQuery.QueryAttr.QueryRange;
import com.vscar.vscar_back_spring.dto.PaginatedResult;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.FacetOperation;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.SortOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class CarsService {

  private final CarRepository carRepository;

  private final MongoTemplate mongoTemplate;

  @Autowired
  public CarsService(CarRepository carRepository, MongoTemplate mongoTemplate) {
    this.carRepository = carRepository;
    this.mongoTemplate = mongoTemplate;
  }

  private Car findFirst() {
    return this.carRepository.findTopBy();
  }

  public String getProcessedDate() {
    String date = findFirst().processedDate();
    return date.substring(0, date.indexOf('.'));
  }

  public Object findValues(String attributeName) {

    Criteria filterCriteria =
        Criteria.where("attributes").elemMatch(Criteria.where("name").is(attributeName));

    Query findQuery = new Query(filterCriteria);
    findQuery.fields().include("adac_id").include("attributes.$");

    AttributeMetadata metaDoc = mongoTemplate.findOne(findQuery, AttributeMetadata.class, "cars");

    if (metaDoc == null || metaDoc.attributes().isEmpty()) {
      throw new IllegalStateException("Metadata not found for attribute: " + attributeName);
    }

    ColumnData colData = metaDoc.attributes().get(0).columnData();
    String attrType = colData.type();

    return switch (attrType) {
      case "int", "float" -> {
        yield colData;
      }
      case "str" -> {
        Aggregation agg =
            newAggregation(
                unwind("attributes"),
                match(Criteria.where("attributes.name").is(attributeName)),
                project().and("attributes.value").as("value"),
                group("value"));

        List<StringValueProjection> results =
            mongoTemplate.aggregate(agg, "cars", StringValueProjection.class).getMappedResults();

        List<String> uniqueValues =
            results.stream()
                .map(StringValueProjection::value)
                .filter(java.util.Optional::isPresent)
                .map(Optional::get)
                .sorted()
                .collect(Collectors.toList());

        yield uniqueValues;
      }
      default -> {
        throw new IllegalStateException("Unsupported attribute type: " + attrType);
      }
    };
  }

  public record StringValueProjection(
      @org.springframework.data.annotation.Id Optional<String> value) {}

  public List<String> findNames(String text) {
    Car car = findFirst();
    return car.attributes().stream()
        .map(Car.CarAttribute::name)
        .filter(name -> name.toLowerCase().contains(text.toLowerCase()) && !name.endsWith("fixed"))
        .distinct()
        .sorted()
        .toList();
  }

  public List<Car> findAll() {
    return this.carRepository.findTop10By();
  }

  public Car findOne(Long id) {
    return this.carRepository.findByAdacId(id);
  }

  public PaginatedResult findByFilter(FilterQuery query) {

    final int page = query.page();
    final int limit = query.limit().orElse(100);
    final String text = query.text();

    List<Criteria> criterias = new ArrayList<>();

    for (QueryAttr attr : query.attributes()) {
      List<Criteria> attrCriteria = new ArrayList<>();
      String key = attr.name();

      if (attr.range().isPresent()) {
        QueryRange range = attr.range().get();
        if (range.min().isPresent() || range.max().isPresent()) {
          Criteria rangeForFixedAttr = Criteria.where("name").is(key + "|fixed");
          if (range.min().isPresent()) {
            rangeForFixedAttr = rangeForFixedAttr.and("value").gte(range.min().get());
          }
          if (range.max().isPresent()) {
            rangeForFixedAttr = rangeForFixedAttr.and("value").lte(range.max().get());
          }
          Criteria rangeCriteria = Criteria.where("attributes").elemMatch(rangeForFixedAttr);
          attrCriteria.add(rangeCriteria);
        }
      }

      if (!attr.values().isEmpty()) {
        List<String> nonNullValues =
            attr.values().stream().filter(Optional::isPresent).map(Optional::get).toList();

        if (!nonNullValues.isEmpty()) {
          Criteria inCriteria =
              Criteria.where("attributes")
                  .elemMatch(Criteria.where("name").is(key).and("value").in(nonNullValues));
          attrCriteria.add(inCriteria);
        }
      }

      if (!attrCriteria.isEmpty()) {
        criterias.add(new Criteria().orOperator(attrCriteria.toArray(Criteria[]::new)));
      }
    }

    if (!text.isEmpty()) {
      Criteria textCriteria = Criteria.where("name").regex(text, "i");
      criterias.add(textCriteria);
    }

    Criteria finalMatchCriteria =
        criterias.isEmpty()
            ? new Criteria()
            : new Criteria().andOperator(criterias.toArray(Criteria[]::new));

    long skip = (long) (page - 1) * limit;

    MatchOperation matchStage = Aggregation.match(finalMatchCriteria);

    SortOperation sortStage = Aggregation.sort(Sort.Direction.ASC, "price");

    List<AggregationOperation> pagedResultsPipeline =
        List.of(Aggregation.skip(skip), Aggregation.limit(limit));

    List<AggregationOperation> totalCountPipeline = List.of(Aggregation.count().as("total"));

    FacetOperation facetStage =
        Aggregation.facet()
            .and(pagedResultsPipeline.toArray(AggregationOperation[]::new))
            .as("paginatedResults")
            .and(totalCountPipeline.toArray(AggregationOperation[]::new))
            .as("totalCount");

    Aggregation aggregation =
        Aggregation.newAggregation(matchStage, sortStage, facetStage)
            .withOptions(Aggregation.newAggregationOptions().build());

    var result = mongoTemplate.aggregate(aggregation, Car.class, FacetResult.class);

    FacetResult facetResult = result.getUniqueMappedResult();
    if (facetResult == null) {
      return new PaginatedResult(page, limit, 0, 0, skip, List.of());
    }

    return buildPaginatedResult(page, limit, skip, facetResult);
  }

  private PaginatedResult buildPaginatedResult(
      int page, int limit, long offset, FacetResult facetResult) {

    List<Car> docs = facetResult.paginatedResults();
    int total = facetResult.totalCount().isEmpty() ? 0 : facetResult.totalCount().get(0).total();
    int pages = (int) Math.ceil((double) total / limit);

    return new PaginatedResult(page, limit, total, pages, offset, docs);
  }

  public record TotalCountData(int total) {}

  public record FacetResult(List<Car> paginatedResults, List<TotalCountData> totalCount) {}
}
