import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { from, iif } from 'rxjs';
import {
  concatAll,
  filter,
  map,
  mergeMap,
  pluck,
  toArray,
} from 'rxjs/operators';
import { Car } from './schemas/car.schema';

@Injectable()
export class CarsService {
  private readonly LIMIT: number = 100;

  constructor(
    @InjectModel(Car.name) private readonly carModel: PaginateModel<Car>,
  ) {}

  async findByFilter(query: any): Promise<PaginateResult<Car>> {
    const page = query['page'];
    const text = query['text'];
    let limit = query['limit'];
    limit = limit < this.LIMIT ? limit : this.LIMIT;
    const dbQuery = {};

    const attrQueries = [];
    for (let attrData of query['attributes']) {
      const key = attrData['name'];
      const values = attrData['values'];
      const range = attrData['range'];
      const rangeMin = attrData['range']['min'];
      const rangeMax = attrData['range']['max'];

      let attrQuery = [];
      if (rangeMin !== undefined && rangeMax !== undefined) {
        attrQuery.push({
          attributes: {
            $elemMatch: {
              name: key + '|fixed',
              value: {
                $gte: parseInt(range['min']),
                $lte: parseInt(range['max']),
              },
            },
          },
        });
      }
      if (values.length > 0) {
        attrQuery.push({
          attributes: {
            $elemMatch: {
              name: key,
              value: {
                $in: (values as string[]).map((v: string) =>
                  v === 'null' ? null : v,
                ),
              },
            },
          },
        });
      }

      if (attrQuery.length > 0)
        attrQueries.push({
          $or: attrQuery,
        });
    }

    if (attrQueries.length > 0) {
      dbQuery['$and'] = attrQueries;
    }

    if (text.length > 0) {
      dbQuery['name'] = { $regex: new RegExp(text, 'i') };
    }

    const pipeline = [
      { $match: dbQuery },
      { $sort: { price: 1 as 1 | -1 } },
      {
        $facet: {
          paginatedResults: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: 'total' }],
        },
      },
    ];

    return from(this.carModel.aggregate(pipeline).exec())
      .pipe(
        map((paginatedResultsData) => {
          let totalPages = 0;
          let totalCount = 0;
          let paginatedResults = [];
          let offset = 0;
          if (
            paginatedResultsData[0].paginatedResults.length > 0 &&
            paginatedResultsData[0].totalCount.length > 0
          ) {
            paginatedResults = paginatedResultsData[0].paginatedResults;
            totalCount = paginatedResultsData[0].totalCount[0].total;
            totalPages = Math.ceil(totalCount / limit);
            offset = (page - 1) * limit;
          }
          return {
            docs: paginatedResults,
            total: totalCount,
            limit: limit,
            page,
            pages: totalPages,
            offset,
            totalDocs: totalCount,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            totalPages: totalPages,
            pagingCounter: (page - 1) * limit + 1,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
          };
        }),
      )
      .toPromise();
  }

  async findOne(id: number): Promise<Car> {
    return this.carModel
      .findOne(
        { adac_id: id },
        {
          attributes: {
            $filter: {
              input: '$attributes',
              as: 'attr',
              cond: {
                $not: {
                  $regexMatch: { input: '$$attr.name', regex: /fixed/i },
                },
              },
            },
          },
          _id: 0,
          name: 1,
          url: 1,
          adac_id: 1,
          processed_date: 1,
          image: 1,
          fuel: 1,
          transmission: 1,
          power: 1,
          price: 1,
        },
      )
      .exec();
  }

  async findAll(): Promise<Car[]> {
    return this.carModel.find().limit(10).sort('price').exec();
  }

  // TODO: move to another service
  async findNames(text: string): Promise<any> {
    return from(this.carModel.findOne().exec())
      .pipe(
        pluck('_doc', 'attributes'),
        concatAll(),
        filter((attr) => !attr['name'].endsWith('fixed')),
        filter((attr) => attr['name'].match(new RegExp(text, 'i'))),
        pluck('name'),
        toArray(),
        map((names) => names.sort()),
      )
      .toPromise();
  }

  async findValues(text: string): Promise<any> {
    // attribute is numeric so take attribute data from column_data
    let numeric_attr = from(
      this.carModel
        .findOne(
          {},
          { _id: 0, attributes: { $elemMatch: { name: { $eq: text } } } },
        )
        .exec(),
    ).pipe(
      pluck('_doc', 'attributes'),
      map((arr) => arr[0]),
      pluck('column_data'),
    );

    // find all values for attribute if type is string
    let str_attr = from(
      this.carModel.aggregate([
        {
          $project: {
            _id: 0,
            attributes: {
              $filter: {
                input: '$attributes',
                as: 'attr',
                cond: {
                  $eq: ['$$attr.name', text],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$attributes.value',
          },
        },
      ]),
    ).pipe(
      concatAll(),
      pluck('_id'),
      concatAll(),
      toArray(),
      map((values) => values.sort()),
    );

    return from(
      this.carModel
        .findOne(
          {},
          { _id: 0, attributes: { $elemMatch: { name: { $eq: text } } } },
        )
        .exec(),
    )
      .pipe(
        pluck('_doc', 'attributes'),
        map((arr) => arr[0]),
        pluck('column_data'),
        mergeMap((data) =>
          iif(() => data.type == 'str', str_attr, numeric_attr),
        ),
      )
      .toPromise();
  }

  async getProcessedDate(): Promise<string> {
    return from(this.carModel.findOne().select('processed_date').exec())
      .pipe(map((car: Car) => car.toJSON()['processed_date'].split('.')[0]))
      .toPromise();
  }
}
