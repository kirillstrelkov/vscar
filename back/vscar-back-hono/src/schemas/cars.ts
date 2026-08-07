import { z } from '@hono/zod-openapi';

export const AttributeFilterSchema = z
  .object({
    name: z.string(),
    values: z.array(z.string()).default([]),
    range: z
      .object({
        min: z.union([z.string(), z.number()]).optional(),
        max: z.union([z.string(), z.number()]).optional(),
      })
      .default({}),
  })
  .openapi('AttributeFilter');

export const FindByFilterBodySchema = z
  .object({
    page: z.number(),
    limit: z.number().optional(),
    text: z.string().default(''),
    attributes: z.array(AttributeFilterSchema).default([]),
  })
  .openapi('FindByFilterBody');

// Car documents are fully dynamic (the original Mongoose schema was an empty
// class with no field validation) — kept loose here for the same reason.
export const CarSchema = z.record(z.string(), z.unknown()).openapi('Car');

export const PaginatedCarsSchema = z
  .object({
    docs: z.array(CarSchema),
    total: z.number(),
    limit: z.number(),
    page: z.number(),
    pages: z.number(),
    offset: z.number(),
    totalDocs: z.number(),
    hasPrevPage: z.boolean(),
    hasNextPage: z.boolean(),
    totalPages: z.number(),
    pagingCounter: z.number(),
    prevPage: z.number().nullable(),
    nextPage: z.number().nullable(),
  })
  .openapi('PaginatedCars');
