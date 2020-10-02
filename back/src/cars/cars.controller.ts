import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { PaginateResult } from 'mongoose';
import { CarsService } from './cars.service';
import { Car } from './schemas/car.schema';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) { }

  // TODO: check implementation
  @Get('findByFilter')
  async findByFilter(@Req() req): Promise<PaginateResult<Car>> {
    const query = req.query;
    for (const key of ['page', 'limit']) {
      query[key] = +query[key];
    };
    return this.carsService.findByFilter(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Car> {
    return this.carsService.findOne(+id);
  }

  @Get()
  async findAll(): Promise<Car[]> {
    return this.carsService.findAll();
  }

  // TODO: move to another controller
  @Get('attributes/names')
  async findNames(@Query('text') text: string): Promise<any> {
    return this.carsService.findNames(text);
  }

  @Get('attributes/values')
  async findValues(@Query('text') text: string): Promise<any> {
    return this.carsService.findValues(text);
  }
}
