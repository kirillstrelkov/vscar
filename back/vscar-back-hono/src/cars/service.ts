import type { Document } from 'mongodb';
import { type Car, getCarsCollection } from '../db.ts';
import {
  type AttributeFilter,
  buildFilter,
  clampLimit,
  type PaginatedResult,
  shapePaginatedResult,
} from './filter.ts';

export async function findByFilter(
  page: number,
  limitInput: number | undefined,
  text: string,
  attributes: AttributeFilter[],
): Promise<PaginatedResult> {
  const limit = clampLimit(limitInput);
  const dbQuery = buildFilter(text, attributes);

  const collection = await getCarsCollection();
  const [facetResult] = await collection
    .aggregate([
      { $match: dbQuery },
      { $sort: { price: 1 } },
      {
        $facet: {
          paginatedResults: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: 'total' }],
        },
      },
    ])
    .toArray();

  return shapePaginatedResult(
    facetResult as { paginatedResults: Document[]; totalCount: { total: number }[] },
    page,
    limit,
  );
}

export async function findOneCar(id: number): Promise<Car | null> {
  const collection = await getCarsCollection();
  return collection.findOne(
    { adac_id: id },
    {
      projection: {
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
        attributes: {
          $filter: {
            input: '$attributes',
            as: 'attr',
            cond: { $not: { $regexMatch: { input: '$$attr.name', regex: /fixed/i } } },
          },
        },
      },
    },
  );
}

export async function findAllCars(): Promise<Car[]> {
  const collection = await getCarsCollection();
  return collection.find({}).sort({ price: 1 }).limit(10).toArray();
}

export async function findAttributeNames(text: string): Promise<string[]> {
  const collection = await getCarsCollection();
  const doc = await collection.findOne({});
  const attributes = doc?.attributes ?? [];
  return attributes
    .filter((attr) => !attr.name.endsWith('fixed'))
    .filter((attr) => attr.name.match(new RegExp(text, 'i')))
    .map((attr) => attr.name)
    .sort();
}

export async function findAttributeValues(text: string): Promise<unknown> {
  const collection = await getCarsCollection();
  const doc = await collection.findOne(
    {},
    { projection: { _id: 0, attributes: { $elemMatch: { name: { $eq: text } } } } },
  );
  const columnData = doc?.attributes?.[0]?.column_data;

  if (columnData?.type === 'str') {
    const grouped = await collection
      .aggregate([
        {
          $project: {
            _id: 0,
            attributes: {
              $filter: { input: '$attributes', as: 'attr', cond: { $eq: ['$$attr.name', text] } },
            },
          },
        },
        { $group: { _id: '$attributes.value' } },
      ])
      .toArray();
    const values = grouped.flatMap((g) => g._id as unknown[]);
    return values.sort();
  }

  return columnData;
}

export async function getProcessedDate(): Promise<string | undefined> {
  const collection = await getCarsCollection();
  const doc = await collection.findOne({}, { projection: { processed_date: 1 } });
  return doc?.processed_date?.split('.')[0];
}
