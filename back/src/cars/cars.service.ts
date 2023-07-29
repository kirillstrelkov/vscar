import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { from, iif } from 'rxjs';
import { concatAll, filter, map, mergeMap, pluck, toArray } from 'rxjs/operators';
import { Car } from './schemas/car.schema';
@Injectable()
export class CarsService {
  private readonly LIMIT: number = 100;

  constructor(@InjectModel(Car.name) private readonly carModel: PaginateModel<Car>) { }

  async findByFilter(query: any): Promise<PaginateResult<Car>> {
    const page = query['page'];
    const text = query['text'];
    let limit = query['limit'];
    limit = limit < this.LIMIT ? limit : this.LIMIT;
    const dbQuery = {};

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
      if (text.length > 0) {
        attrQueries.push({ 'name': { $regex: new RegExp(text, 'i') } });
      }
    } else if (text.length > 0) {
      dbQuery['name'] = { $regex: new RegExp(text, 'i') };
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
    return from(this.carModel.findOne().exec()).pipe(
      pluck('_doc', 'attributes'),
      concatAll(),
      filter(attr => !attr['name'].endsWith('fixed')),
      filter(attr => attr['name'].match(new RegExp(text, 'i'))),
      pluck('name'),
      toArray(),
      map(names => names.sort())
    ).toPromise();
  };

  async findValues(text: string): Promise<any> {
    // attribute is numeric so take attribute data from column_data
    let numeric_attr = from(this.carModel.findOne({}, { _id: 0, attributes: { $elemMatch: { name: { $eq: text } } } }).exec()).pipe(
      pluck('_doc', 'attributes'),
      map(arr => arr[0]),
      pluck('column_data'),
    );

    // find all values for attribute if type is string
    let str_attr = from(this.carModel.aggregate([{
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
    );

    return from(this.carModel.findOne({}, { _id: 0, attributes: { $elemMatch: { name: { $eq: text } } } }).exec()).pipe(
      pluck('_doc', 'attributes'),
      map(arr => arr[0]),
      pluck('column_data'),
      mergeMap(data => iif(
        () => data.type == 'str',
        str_attr,
        numeric_attr,
      ))
    ).toPromise();
  }
}
