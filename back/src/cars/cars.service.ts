import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { Car } from './schemas/car.schema';

@Injectable()
export class CarsService {
  private readonly LIMIT: number = 100;

  constructor(@InjectModel(Car.name) private readonly carModel: PaginateModel<Car>) { }

  async findByFilter(page: number, limit: number, text: string): Promise<PaginateResult<Car>> {
    limit = limit < this.LIMIT ? limit : this.LIMIT;
    return this.carModel.paginate({name: { $regex: new RegExp(text, 'i') }}, { page: page, limit: limit, sort: 'price' });
  }


  async findOne(id: number): Promise<Car> {
    return this.carModel.findOne({ 'adac_id': id }).exec();
  }

  async findAll(): Promise<Car[]> {
    return this.carModel.find().limit(10).sort('price').exec();
  }
}
