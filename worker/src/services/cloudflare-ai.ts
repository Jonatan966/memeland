import OpenAI from "openai";

export function createCloudflareAIService(envs: Env) {
  const openAIService = new OpenAI({
    apiKey: envs.CLOUDFLARE_API_KEY,
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${envs.CLOUDFLARE_ACCOUNT_ID}/ai/v1`
  });

  return openAIService;
}
