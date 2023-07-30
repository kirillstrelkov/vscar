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
    console.log(Object.entries(query));
    for (let [key, values] of Object.entries(query)) {
      if (['page', 'text', 'limit'].indexOf(key) !== -1) {
        continue;
      }
      if (key.indexOf('_range') !== -1) {
        key = key.replace('_range', '|fixed');
        attrQueries.push({
          "attributes": {
            $elemMatch: {
              name: key,
              value: { $gte: parseInt(values[0]), $lte: parseInt(values[1]) }
            }
          }
        });
      } else {
        attrQueries.push({
          "attributes": {
            $elemMatch: {
              name: key,
              value: {
                $in: (values as string[]).map((v: string) => v === 'null' ? null : v)
              }
            }
          }
        });
      }
    }

    if (attrQueries.length > 0) {
      console.log(JSON.stringify(attrQueries, null, "  "));
      dbQuery['$and'] = attrQueries;
    }

    if (text.length > 0) {
      dbQuery['name'] = { $regex: new RegExp(text, 'i') };
    }

    console.log(JSON.stringify(dbQuery, null, "  "));
    console.log(dbQuery);

    const pipeline = [
      { $match: dbQuery },
      { $sort: { 'price': 1 } },
      {
        $facet: {
          paginatedResults: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [
            { $count: 'total' }
          ]
        }
      },
      { $unwind: '$paginatedResults' },
      { $replaceRoot: { newRoot: '$paginatedResults' } }
    ];


    const paginatedResultsQuery = this.carModel.aggregate(pipeline).exec();
    const totalCountQuery = this.carModel.estimatedDocumentCount();

    const combinedQueries$ = from(Promise.all([totalCountQuery, paginatedResultsQuery]));

    return combinedQueries$.pipe(
      map(([totalCount, paginatedResults]) => {
        const totalPages = Math.ceil(totalCount / limit);
        const offset = (page - 1) * limit;
        return {
          docs: paginatedResults,
          total: totalCount,
          limit: limit,
          page,
          pages: totalPages,
          offset
        };
      })
    ).toPromise();
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
