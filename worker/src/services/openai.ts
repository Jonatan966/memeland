import OpenAI from "openai";

export function createOpenAIService(envs: Env) {
  const openAIService = new OpenAI({
    apiKey: envs.OPENAI_API_KEY,
  });

  return openAIService;
}
