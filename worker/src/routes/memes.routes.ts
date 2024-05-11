import { sha1 } from "hono/utils/crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createStorageService } from "../services/storage";
import { createOpenAIService } from "../services/openai";
import { createSupabaseService } from "../services/supabase";
import { createHonoApp } from "../libs/hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { bodyLimit } from "hono/body-limit";

const memesRouter = createHonoApp();

memesRouter.post(
  "/",
  bodyLimit({
    maxSize: 1024 * 1600, // 1.6MB
  }),
  async (context) => {
    const { response, user } = await authMiddleware(context);

    if (response) {
      return response;
    }

    const storageService = createStorageService(context.env);
    const openAIService = createOpenAIService(context.env);
    const supabaseService = createSupabaseService(context.env);

    const formData = await context.req.formData();

    const description = String(formData.get("description"));
    const keywords = JSON.parse(String(formData.get("keywords")));

    const memeFile = formData.get("meme") as File;
    const memeFileData = await memeFile.arrayBuffer();
    const fileHash = await sha1(memeFileData);

    const availableMemeFileTypes = [
      "image/jpeg",
      "image/webp",
      "image/png",
      "video/mp4",
      "image/gif",
    ];

    if (!availableMemeFileTypes.includes(memeFile.type)) {
      return context.json({
        error: {
          message: "File format is invalid",
        },
      }, 400);
    }

    const fileExtension = memeFile.name.substring(
      memeFile.name.lastIndexOf("."),
    );
    const memeFileKey = `${user.id}/${fileHash}${fileExtension}`;

    await storageService.send(
      new PutObjectCommand({
        Bucket: "memes",
        Key: memeFileKey,
        Body: memeFileData as any,
        ContentType: memeFile.type,
      }),
    );

    const embeddingResponse = await openAIService.embeddings.create({
      input: description,
      model: "text-embedding-ada-002",
    });

    const { error } = await supabaseService.from("memes").insert({
      embedding: embeddingResponse.data.flatMap((item) => item.embedding),
      description,
      keywords,
      user_id: user.id,
      file: memeFileKey,
    });

    return context.json({ error }, error ? 500 : 201);
  },
);

memesRouter.get("/search", async (context) => {
  const { response, user } = await authMiddleware(context);

  if (response) {
    return response;
  }

  const openAIService = createOpenAIService(context.env);
  const supabaseService = createSupabaseService(context.env);

  const querySearch = context.req.query("q")?.trim();

  if (!querySearch) {
    return context.json({
      error: {
        message: "Query search param is required",
      },
    }, 400);
  }

  const queryEmbeddingResponse = await openAIService.embeddings.create({
    input: querySearch,
    model: "text-embedding-ada-002",
  });

  const { data, error: queryError } = await supabaseService.rpc(
    "search_memes",
    {
      query_embedding: queryEmbeddingResponse.data.flatMap((item) =>
        item.embedding
      ),
      similarity_threshold: 0.75,
      match_count: 10,
      owner_id: user.id,
    },
  );

  return context.json({
    data,
    error: queryError,
  }, 200);
});

export { memesRouter };