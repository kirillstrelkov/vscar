/* (C) 2025 */
package com.vscar.vscar_back_spring;

import com.vscar.vscar_back_spring.dto.AttributeValueProjection;
import com.vscar.vscar_back_spring.dto.Car;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CarRepository extends MongoRepository<Car, String> {

  @Aggregation({
    "{ $project: { "
        + "id: '$_id', "
        + "matchingValues: { "
        + "    $filter: { "
        + "        input: '$attributes', "
        + "        as: 'attr', "
        + "        cond: { $eq: [ '$$attr.name', ?0 ] }"
        + "    } "
        + "}"
        + " } }",
    "{ $project: { "
        + "id: '$_id', "
        + "matchingValues: { "
        + "    $map: { "
        + "        input: '$matchingValues', "
        + "        as: 'match', "
        + "        in: '$$match.value' "
        + "    } "
        + "}"
        + " } }"
  })
  List<AttributeValueProjection> findValuesByAttributeName(String name);

  List<Car> findBy(Pageable pageable);

  List<Car> findTop10By();

  Car findTopBy();

  Car findByAdacId(Long id);
}
