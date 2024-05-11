import { cors } from "hono/cors";

import { memesRouter } from "./routes/memes.routes";
import { keywordsRouter } from "./routes/keywords.routes";
import { createHonoApp } from "./libs/hono";

const app = createHonoApp();

app.use("/*", cors());

app.route("/memes", memesRouter);
app.route("/keywords", keywordsRouter);

export default app;
