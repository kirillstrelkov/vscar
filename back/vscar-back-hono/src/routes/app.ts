import { Hono } from 'hono';

export const appRoutes = new Hono();

appRoutes.get('/', (c) => c.redirect('/api'));
