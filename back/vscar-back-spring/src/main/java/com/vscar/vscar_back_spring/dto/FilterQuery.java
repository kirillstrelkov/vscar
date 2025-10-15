/* (C) 2025 */
package com.vscar.vscar_back_spring.dto;

import java.util.List;
import java.util.Optional;

public record FilterQuery(
    int page, String text, Optional<Integer> limit, List<QueryAttr> attributes) {

  public record QueryAttr(String name, List<Optional<String>> values, Optional<QueryRange> range) {

    public record QueryRange(Optional<Integer> min, Optional<Integer> max) {}
  }
}
