import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaginateResult } from 'mongoose';
import { CarsService } from './cars.service';
import { Car } from './schemas/car.schema';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post('findByFilter')
  async findByFilter(@Body() jsonRequest): Promise<PaginateResult<Car>> {
    return this.carsService.findByFilter(jsonRequest);
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

  @Get('db/version')
  async getVersion(): Promise<string> {
    return this.carsService.getProcessedDate();
  }
}
