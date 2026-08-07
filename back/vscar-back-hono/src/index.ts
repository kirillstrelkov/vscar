import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { cacheMiddleware } from './cache.ts';
import { config } from './config.ts';
import { ensureIndexes } from './db.ts';
import { appRoutes } from './routes/app.ts';
import { carsRoutes } from './routes/cars.ts';

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

const app = new OpenAPIHono();

app.use('*', secureHeaders());
app.use('*', cors());
app.use('*', cacheMiddleware(SEVEN_DAYS_SECONDS));

app.route('/', appRoutes);
app.route('/cars', carsRoutes);

app.doc('/api/doc', {
  openapi: '3.0.0',
  info: { title: 'Cars', description: 'The cars API description', version: '1.1' },
});
app.get('/api', swaggerUI({ url: '/api/doc' }));

await ensureIndexes();

Deno.serve({ port: config.port }, app.fetch);
