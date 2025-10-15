/* (C) 2025 */
package com.vscar.vscar_back_spring.dto;

import java.util.List;

public record PaginatedResult(
    int page, int limit, int total, int pages, long offset, List<Car> docs) {}
