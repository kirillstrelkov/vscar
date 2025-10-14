/* (C) 2025 */
package com.vscar.vscar_back_spring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "cars")
public record Car(
    String id,
    String name,
    String url,
    @Field("adac_id") @JsonProperty("adac_id") Long adacId,
    @Field("processed_date") @JsonProperty("processed_date") String processedDate,
    String image,
    String fuel,
    String transmission,
    Integer power,
    Integer price,
    List<CarAttribute> attributes) {

  public record CarAttribute(
      String name,
      String value,
      @Field("column_data") @JsonProperty("column_data") ColumnData columnData) {}

  public record ColumnData(
      String type,
      @Field("additional_values") @JsonProperty("additional_values")
          List<Optional<String>> additionalValues,
      Map<String, Float> range) {}
}
