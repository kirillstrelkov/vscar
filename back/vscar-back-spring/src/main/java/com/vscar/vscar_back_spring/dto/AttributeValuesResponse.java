/* (C) 2025 */
package com.vscar.vscar_back_spring.dto;

import com.vscar.vscar_back_spring.dto.Car.ColumnData;
import java.util.List;
import java.util.Optional;

public record AttributeValuesResponse(
    Optional<List<String>> stringValues, Optional<ColumnData> rangeMetadata) {}
