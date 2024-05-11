import { Context } from "hono";
import { createSupabaseService } from "../services/supabase";
import { HonoEnv } from "../libs/hono";

export async function authMiddleware(context: Context<HonoEnv>) {
  const authorization = context.req.header("authorization");

  if (!authorization) {
    return {
      response: context.json({
        error: {
          message: "Authorization token is required",
        },
      }, 401),
    };
  }

  const supabaseService = createSupabaseService(context.env);

  const userResponse = await supabaseService.auth.getUser(authorization);

  if (userResponse.error || !userResponse?.data?.user?.id) {
    return {
      response: context.json({
        error: {
          message: "Token is not valid",
        },
      }, 401),
    };
  }

  return { user: userResponse.data.user };
}
