import { z } from "zod";
import { createHonoApp } from "../libs/hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createOpenAIService } from "../services/openai";

const keywordsRouter = createHonoApp();

keywordsRouter.post("/", async (context) => {
  const { response } = await authMiddleware(context);

  if (response) {
    return response;
  }

  const openAIService = createOpenAIService(context.env);

  const body = await context.req.json();

  const bodySchema = z.object({
    description: z.string(),
  });

  const { description } = await bodySchema.parseAsync(body);

  const keywordsResponse = await openAIService.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content:
          'Você receberá um bloco de texto e sua tarefa é extrair dele uma lista de palavras-chave. Responda apenas com lista de palavras-chave separadas por vírgula. Retorne um JSON no seguinte formato: ```{"keywords": ["key1", "key2", "etc"]}```',
      },
      {
        role: "user",
        content: `\`\`\`${description}\`\`\``,
      },
    ],
  });

  const result = JSON.parse(keywordsResponse.choices[0].message.content!);

  return context.json(
    { keywords: result.keywords },
    201,
  );
});

export { keywordsRouter };
