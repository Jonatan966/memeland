import { cors } from 'hono/cors';

import { memesRouter } from './routes/memes.routes';
import { keywordsRouter } from './routes/keywords.routes';
import { createHonoApp } from './libs/hono';
import { authRouter } from './routes/auth.routes';

const app = createHonoApp();

app.use('/*', cors());

app.get('/', (ctx) => ctx.json({ ok: true }, 200));

app.route('/memes', memesRouter);
app.route('/keywords', keywordsRouter);
app.route('/auth', authRouter);

export default app;
