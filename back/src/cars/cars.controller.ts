import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginateResult } from 'mongoose';
import { CarsService } from './cars.service';
import { Car } from './schemas/car.schema';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) { }

  @Get('findByFilter')
  async findByFilter(@Query('page') page: number, @Query('limit') limit: number, @Query('text') text: string): Promise<PaginateResult<Car>> {
    return this.carsService.findByFilter(+page, +limit, text);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Car> {
    return this.carsService.findOne(+id)
  }

  @Get()
  async findAll(): Promise<Car[]> {
    return this.carsService.findAll();
  }
}
