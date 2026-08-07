import type { Document } from 'mongodb';

export interface AttributeFilter {
  name: string;
  values: string[];
  range: { min?: string | number; max?: string | number };
}

const LIMIT = 100;

/** Literal port of the original NestJS service's `limit < LIMIT ? limit : LIMIT` —
 * an omitted limit (undefined) also resolves to LIMIT, same as the original. */
export function clampLimit(limit: number | undefined): number {
  return limit !== undefined && limit < LIMIT ? limit : LIMIT;
}

/** Builds the MongoDB `$match` filter from free-text + per-attribute range/values
 * filters. Ported field-for-field from the original CarsService.findByFilter. */
export function buildFilter(text: string, attributes: AttributeFilter[]): Document {
  const dbQuery: Document = {};
  const attrQueries: Document[] = [];

  for (const attrData of attributes) {
    const { name: key, values, range } = attrData;
    const { min, max } = range;

    const attrQuery: Document[] = [];
    if (min !== undefined && max !== undefined) {
      attrQuery.push({
        attributes: {
          $elemMatch: {
            name: `${key}|fixed`,
            value: { $gte: parseInt(String(min), 10), $lte: parseInt(String(max), 10) },
          },
        },
      });
    }
    if (values.length > 0) {
      attrQuery.push({
        attributes: {
          $elemMatch: {
            name: key,
            value: { $in: values.map((v) => (v === 'null' ? null : v)) },
          },
        },
      });
    }
    if (attrQuery.length > 0) {
      attrQueries.push({ $or: attrQuery });
    }
  }

  if (attrQueries.length > 0) {
    dbQuery.$and = attrQueries;
  }
  if (text.length > 0) {
    dbQuery.name = { $regex: new RegExp(text, 'i') };
  }
  return dbQuery;
}

export interface PaginatedResult {
  docs: Document[];
  total: number;
  limit: number;
  page: number;
  pages: number;
  offset: number;
  totalDocs: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  totalPages: number;
  pagingCounter: number;
  prevPage: number | null;
  nextPage: number | null;
}

/** Shapes the `$facet` aggregation result into the mongoose-paginate-v2-compatible
 * response the frontend expects, matching the original's exact field semantics. */
export function shapePaginatedResult(
  facetResult: { paginatedResults: Document[]; totalCount: { total: number }[] },
  page: number,
  limit: number,
): PaginatedResult {
  let totalPages = 0;
  let totalCount = 0;
  let paginatedResults: Document[] = [];
  let offset = 0;

  if (facetResult.paginatedResults.length > 0 && facetResult.totalCount.length > 0) {
    paginatedResults = facetResult.paginatedResults;
    totalCount = facetResult.totalCount[0].total;
    totalPages = Math.ceil(totalCount / limit);
    offset = (page - 1) * limit;
  }

  return {
    docs: paginatedResults,
    total: totalCount,
    limit,
    page,
    pages: totalPages,
    offset,
    totalDocs: totalCount,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    totalPages,
    pagingCounter: (page - 1) * limit + 1,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
  };
}
