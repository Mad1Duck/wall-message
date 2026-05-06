import 'reflect-metadata';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HonoRouteBuilder } from 'hono-forge';
import { env } from './env';
import { WallsController } from './controllers/walls.controller';
import { MessagesController } from './controllers/messages.controller';
import { MiniWallsController } from './controllers/mini-walls.controller';

HonoRouteBuilder.configure({
  onError: (err, c) => {
    console.error(err);
    return c.json({ error: (err as Error).message ?? 'Internal server error' }, 500);
  },
});

const app = new Hono();

app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow no origin (mobile apps, curl, etc)
      if (!origin) return '*';
      // Allow configured frontend URL if wildcard
      if (env.FRONTEND_URL === '*') return '*';
      // Allow exact match
      if (origin === env.FRONTEND_URL) return origin;
      // Allow localhost for development
      if (origin.startsWith('http://localhost')) return origin;
      // Allow the production frontend
      if (origin === 'https://wall-message.vercel.app') return origin;
      return undefined;
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.route('/', HonoRouteBuilder.build(WallsController));
app.route('/', HonoRouteBuilder.build(MessagesController));
app.route('/', HonoRouteBuilder.build(MiniWallsController));

app.get('/health', (c) => c.json({ status: 'ok' }));

export default {
  port: env.PORT,
  fetch: app.fetch,
};
