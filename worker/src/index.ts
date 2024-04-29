/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const corsHeaders = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response("OK", {
        headers: corsHeaders,
      });
    }

    const formData = await request.formData();
    const method = formData.get("method")!;
    const token = request.headers.get("authorization")!;

    const openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    const supabaseClient = createClient(
      env.SUPABASE_PROJECT_URL,
      env.SUPABASE_ANON_KEY,
    );
    const storageService = new S3Client({
      region: "auto",
      forcePathStyle: true,
      endpoint: env.SUPABASE_STORAGE_ENDPOINT!,
      credentials: {
        accessKeyId: env.SUPABASE_STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: env.SUPABASE_STORAGE_SECRET_ACCESS_KEY,
      },
    });

    const user = await supabaseClient.auth.getUser(token);

    const userId = user?.data?.user?.id;

    if (!userId) {
      return new Response(undefined, {
        status: 401,
      });
    }

    switch (method) {
      case "sendMeme":
        const description = String(formData.get("description"));
        const keywords = JSON.parse(String(formData.get("keywords")));

        const memeFile = formData.get("meme") as File;
        const memeFileData = await memeFile.arrayBuffer();
        const fileHash = await sha1(memeFileData);

        const fileExtension = memeFile.name.substring(
          memeFile.name.lastIndexOf("."),
        );
        const memeFileKey = `${userId}/${fileHash}${fileExtension}`;

        await storageService.send(
          new PutObjectCommand({
            Bucket: "memes",
            Key: memeFileKey,
            Body: memeFileData as any,
            ContentType: memeFile.type,
          }),
        );

        const embeddingResponse = await openaiClient.embeddings.create({
          input: description,
          model: "text-embedding-ada-002",
        });

        const { error } = await supabaseClient.from("memes").insert({
          embedding: embeddingResponse.data.flatMap((item) => item.embedding),
          description,
          keywords,
          user_id: userId,
          file: memeFileKey,
        });

        return new Response(JSON.stringify({ error }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      case "searchMemes":
        const query = String(formData.get("query"));

        const queryEmbeddingResponse = await openaiClient.embeddings.create({
          input: query,
          model: "text-embedding-ada-002",
        });

        const { data, error: queryError } = await supabaseClient.rpc(
          "search_memes",
          {
            query_embedding: queryEmbeddingResponse.data.flatMap((item) =>
              item.embedding
            ),
            similarity_threshold: 0.75,
            match_count: 10,
            owner_id: userId,
          },
        );

        return new Response(JSON.stringify({ error: queryError, data }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
    }

    return new Response(
      JSON.stringify({}),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  },
};

async function sha1(data: any) {
  const digest = await crypto.subtle.digest("SHA-1", data);
  const array = Array.from(new Uint8Array(digest));
  return array.map((b) => b.toString(16).padStart(2, "0")).join("");
}
