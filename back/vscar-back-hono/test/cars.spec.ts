import { describe, expect, it, vi } from 'vitest';
import { buildFilter, clampLimit, shapePaginatedResult } from '../src/cars/filter.ts';

describe('clampLimit', () => {
  it('defaults an omitted limit to 100', () => {
    expect(clampLimit(undefined)).toBe(100);
  });

  it('keeps a limit below 100 as-is', () => {
    expect(clampLimit(10)).toBe(10);
  });

  it('clamps a limit of 100 or above to 100', () => {
    expect(clampLimit(100)).toBe(100);
    expect(clampLimit(500)).toBe(100);
  });
});

describe('buildFilter', () => {
  it('returns an empty query when there is no text and no attributes', () => {
    expect(buildFilter('', [])).toEqual({});
  });

  it('adds a case-insensitive name regex when text is provided', () => {
    const query = buildFilter('golf', []);
    expect(query.name.$regex).toBeInstanceOf(RegExp);
    expect('VW Golf GTI').toMatch(query.name.$regex);
  });

  it('builds a range condition on the "|fixed" field variant', () => {
    const query = buildFilter('', [
      { name: 'power', values: [], range: { min: '100', max: '200' } },
    ]);
    expect(query.$and).toEqual([
      {
        $or: [
          { attributes: { $elemMatch: { name: 'power|fixed', value: { $gte: 100, $lte: 200 } } } },
        ],
      },
    ]);
  });

  it('maps the literal string "null" to a real null in a values filter', () => {
    const query = buildFilter('', [{ name: 'fuel', values: ['diesel', 'null'], range: {} }]);
    expect(query.$and).toEqual([
      {
        $or: [{ attributes: { $elemMatch: { name: 'fuel', value: { $in: ['diesel', null] } } } }],
      },
    ]);
  });

  it('combines range and values conditions for one attribute with $or', () => {
    const query = buildFilter('', [{ name: 'power', values: ['x'], range: { min: 1, max: 2 } }]);
    expect(query.$and[0].$or).toHaveLength(2);
  });

  it('skips an attribute entirely when neither range nor values is given', () => {
    const query = buildFilter('', [{ name: 'power', values: [], range: {} }]);
    expect(query.$and).toBeUndefined();
  });
});

describe('shapePaginatedResult', () => {
  it('returns zeroed defaults when there are no matches', () => {
    const result = shapePaginatedResult({ paginatedResults: [], totalCount: [] }, 1, 100);
    expect(result).toMatchObject({
      docs: [],
      total: 0,
      totalPages: 0,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
      pagingCounter: 1,
    });
  });

  it('computes pagination fields for a mid-range page', () => {
    const docs = [{ name: 'a' }, { name: 'b' }];
    const result = shapePaginatedResult(
      { paginatedResults: docs, totalCount: [{ total: 45 }] },
      2,
      10,
    );
    expect(result).toMatchObject({
      docs,
      total: 45,
      totalDocs: 45,
      totalPages: 5,
      offset: 10,
      hasPrevPage: true,
      hasNextPage: true,
      prevPage: 1,
      nextPage: 3,
      pagingCounter: 11,
    });
  });

  it('has no next page on the last page', () => {
    const result = shapePaginatedResult(
      { paginatedResults: [{}], totalCount: [{ total: 10 }] },
      1,
      10,
    );
    expect(result.hasNextPage).toBe(false);
    expect(result.nextPage).toBeNull();
  });
});

vi.mock('../src/db.ts', () => ({
  getCarsCollection: vi.fn(),
  ensureIndexes: vi.fn(),
}));

describe('app routing', () => {
  it('redirects GET / to /api', async () => {
    const { default: app } = await import('../src/routes/app.ts').then((m) => ({
      default: m.appRoutes,
    }));
    const res = await app.request('/');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/api');
  });
});
