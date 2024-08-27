import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { zValidator } from "@hono/zod-validator";
import { createHonoApp } from "../libs/hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createOpenAIService } from "../services/openai";

const keywordsRouter = createHonoApp();

keywordsRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      description: z.string(),
    }),
  ),
  async (context) => {
    const { response } = await authMiddleware(context);

    if (response) {
      return response;
    }

    const openAIService = createOpenAIService(context.env);

    const { description } = context.req.valid("json");

    const keywordsResponse = await openAIService.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      response_format: zodResponseFormat(
        z.object({
          keywords: z.array(z.string()),
        }),
        "keywords"
      ),
      messages: [
        {
          role: "system",
          content:
            'Você receberá um bloco de texto e sua tarefa é extrair dele uma lista de palavras-chave.',
        },
        {
          role: "user",
          content: `\`\`\`Charli XCX mostrando o seu album BRAT\`\`\``,
        },
      ],
    });

    const result = JSON.parse(keywordsResponse.choices[0].message.content!);

    return context.json(
      { keywords: result.keywords },
      201,
    );
  },
);

export { keywordsRouter };
