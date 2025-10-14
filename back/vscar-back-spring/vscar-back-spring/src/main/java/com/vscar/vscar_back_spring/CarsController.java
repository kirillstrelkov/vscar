/* (C) 2025 */
package com.vscar.vscar_back_spring;

import com.vscar.vscar_back_spring.dto.Car;
import com.vscar.vscar_back_spring.dto.FilterQuery;
import com.vscar.vscar_back_spring.dto.PaginatedResult;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author kiril
 */
@RestController
@RequestMapping("cars")
public class CarsController {

  private final CarsService carsService;

  @Autowired
  public CarsController(CarsService carsService) {
    this.carsService = carsService;
  }

  @PostMapping("findByFilter")
  public PaginatedResult findByFilter(@RequestBody FilterQuery query) {
    return this.carsService.findByFilter(query);
  }

  @GetMapping("{id}")
  public Car findOne(@PathVariable("id") Long id) {
    return this.carsService.findOne(id);
  }

  @GetMapping()
  public List<Car> findAll() {
    return this.carsService.findAll();
  }

  @GetMapping("attributes/names")
  public List<String> findNames(@RequestParam("text") Optional<String> text) {
    return this.carsService.findNames(text.orElse(""));
  }

  @GetMapping("attributes/values")
  public Object findValues(@RequestParam("text") Optional<String> text) {
    return this.carsService.findValues(text.orElse(""));
  }

  @GetMapping(value = "db/version", produces = MediaType.TEXT_PLAIN_VALUE)
  public String getVersion() {
    return this.carsService.getProcessedDate();
  }
}
