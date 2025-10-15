/* (C) 2025 */
package com.vscar.vscar_back_spring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vscar.vscar_back_spring.dto.Car.ColumnData;
import java.util.List;
import org.springframework.data.mongodb.core.mapping.Field;

public record AttributeMetadata(String id, List<AttributeContent> attributes) {

  public record AttributeContent(
      String name, @Field("column_data") @JsonProperty("column_data") ColumnData columnData) {}
}
