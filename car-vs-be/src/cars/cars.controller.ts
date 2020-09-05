import { Controller, Get, Param } from '@nestjs/common';
import { CarsService } from './cars.service';
import { Car } from './schemas/car.schema';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) { }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Car> {
    return this.carsService.findOne(+id)
  }

  @Get()
  async findAll(): Promise<Car[]> {
    return this.carsService.findAll();
  }
}
