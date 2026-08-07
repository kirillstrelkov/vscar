import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import {
  findAllCars,
  findAttributeNames,
  findAttributeValues,
  findByFilter,
  findOneCar,
  getProcessedDate,
} from '../cars/service.ts';
import { CarSchema, FindByFilterBodySchema, PaginatedCarsSchema } from '../schemas/cars.ts';

export const carsRoutes = new OpenAPIHono();

carsRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/findByFilter',
    request: { body: { content: { 'application/json': { schema: FindByFilterBodySchema } } } },
    responses: {
      200: {
        content: { 'application/json': { schema: PaginatedCarsSchema } },
        description: 'Paginated cars',
      },
    },
  }),
  async (c) => {
    const { page, limit, text, attributes } = c.req.valid('json');
    const result = await findByFilter(page, limit, text, attributes);
    return c.json(result);
  },
);

carsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: { content: { 'application/json': { schema: CarSchema } }, description: 'A single car' },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    const car = await findOneCar(+id);
    return c.json(car ?? {});
  },
);

carsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/',
    responses: {
      200: {
        content: { 'application/json': { schema: z.array(CarSchema) } },
        description: 'Cheapest 10 cars',
      },
    },
  }),
  async (c) => {
    const cars = await findAllCars();
    return c.json(cars);
  },
);

carsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/attributes/names',
    request: { query: z.object({ text: z.string().optional() }) },
    responses: {
      200: {
        content: { 'application/json': { schema: z.array(z.string()) } },
        description: 'Attribute names',
      },
    },
  }),
  async (c) => {
    const { text } = c.req.valid('query');
    const names = await findAttributeNames(text ?? '');
    return c.json(names);
  },
);

carsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/attributes/values',
    request: { query: z.object({ text: z.string().optional() }) },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.union([z.array(z.string()), z.record(z.string(), z.unknown())]),
          },
        },
        description: 'Distinct values (string attributes) or column metadata (numeric attributes)',
      },
    },
  }),
  async (c) => {
    const { text } = c.req.valid('query');
    const values = await findAttributeValues(text ?? '');
    return c.json((values ?? {}) as string[] | Record<string, unknown>);
  },
);

carsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/db/version',
    responses: {
      200: {
        content: { 'text/plain': { schema: z.string() } },
        description: 'DB processed_date, seconds precision',
      },
    },
  }),
  async (c) => {
    const processedDate = await getProcessedDate();
    return c.text(processedDate ?? '');
  },
);
