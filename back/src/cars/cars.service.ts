import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { Car } from './schemas/car.schema';
import { from } from 'rxjs';
import { map, filter, pluck, concatAll, toArray } from 'rxjs/operators';

@Injectable()
export class CarsService {
  private readonly LIMIT: number = 100;

  constructor(@InjectModel(Car.name) private readonly carModel: PaginateModel<Car>) { }

  async findByFilter(query: any): Promise<PaginateResult<Car>> {
    const page = query['page'];
    const text = query['text'];
    let limit = query['limit'];
    limit = limit < this.LIMIT ? limit : this.LIMIT;
    const dbQuery = { name: { $regex: new RegExp(text, 'i') } };

    const attrQueries = [];
    for (const [key, value] of Object.entries(query)) {
      if (['page', 'text', 'limit'].indexOf(key) !== -1) {
        continue;
      }
      attrQueries.push({
        'attributes.name': key,
        'attributes.value': { $in: value }
      });
    }
    if (attrQueries.length > 0) {
      dbQuery['$and'] = attrQueries;
    }

    return this.carModel.paginate(
      dbQuery,
      { page: page, limit: limit, sort: 'price' }
    );
  }


  async findOne(id: number): Promise<Car> {
    return this.carModel.findOne({ 'adac_id': id }).exec();
  };

  async findAll(): Promise<Car[]> {
    return this.carModel.find().limit(10).sort('price').exec();
  };

  // TODO: move to another service
  async findNames(text: string): Promise<any> {
    // TODO: find better implementation
    return from(this.carModel.findOne().exec()).pipe(
      pluck('_doc', 'attributes'),
      concatAll(),
      filter(attr => attr['name'].match(new RegExp(text, 'i'))),
      pluck('name'),
      toArray(),
      map(names => names.sort())
    ).toPromise();
  };

  async findValues(text: string): Promise<any> {
    // TODO: find better implementation

    return from(this.carModel.aggregate([{
      $project: {
        _id: 0,
        attributes: {
          $filter: {
            input: "$attributes",
            as: "attr",
            cond: {
              $eq: ["$$attr.name", text]
            }
          }
        }
      }
    }, {
      $group: {
        _id: "$attributes.value"
      }
    }])).pipe(
      concatAll(),
      pluck('_id'),
      concatAll(),
      toArray(),
      map(values => values.sort())
    ).toPromise();
  }
}
