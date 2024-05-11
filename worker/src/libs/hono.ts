import { Hono } from "hono";

export type HonoEnv = { Bindings: Env };

export function createHonoApp() {
  return new Hono<HonoEnv>();
}
