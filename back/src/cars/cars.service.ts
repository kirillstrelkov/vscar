import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car } from './schemas/car.schema';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private readonly carModel: Model<Car>) { }

  async findOne(id: number): Promise<Car> {
    return this.carModel.findOne({ 'adac_id': id }).exec();
  }


  async findAll(): Promise<Car[]> {
    return this.carModel.find().limit(10).sort('price').exec();
  }
}
