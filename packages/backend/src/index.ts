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
    origin: env.FRONTEND_URL,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.route('/', HonoRouteBuilder.build(WallsController));
app.route('/', HonoRouteBuilder.build(MessagesController));
app.route('/', HonoRouteBuilder.build(MiniWallsController));

app.get('/health', (c) => c.json({ status: 'ok' }));


// export default {
//   port: env.PORT,
//   fetch: app.fetch,
// };

export default app.fetch;
