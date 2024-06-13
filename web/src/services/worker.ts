import { FileDimensions } from "@/utils/get-file-dimensions";
import { Meme } from "./supabase";

interface SendMemeProps {
  description: string;
  keywords: string[];
  meme: File;
  userToken: string;
  dimensions?: FileDimensions;
}

interface GenerateKeywordsProps {
  description: string;
  userToken: string;
}

interface SearchMemesProps {
  query: string;
  userToken: string;
}

interface GenerateKeywordsReturn {
  keywords: string[];
}

interface SearchMemesReturn {
  data: Meme[];
  error?: {
    message: string;
  };
}

export const workerService = {
  apiUrl: import.meta.env.VITE_WORKER_URL,
  async sendMeme(data: SendMemeProps) {
    const formData = new FormData();

    formData.append("description", data.description);
    formData.append("keywords", JSON.stringify(data.keywords));
    formData.append("meme", data.meme);
    formData.append("dimensions", JSON.stringify(data.dimensions));

    const response = await fetch(`${workerService.apiUrl}/memes`, {
      method: "POST",
      body: formData,
      headers: {
        authorization: data.userToken,
      },
    });

    const result = await response.json();

    return result;
  },
  async generateKeywords(
    data: GenerateKeywordsProps,
  ): Promise<GenerateKeywordsReturn> {
    const response = await fetch(
      `${workerService.apiUrl}/keywords`,
      {
        method: "POST",
        body: JSON.stringify({
          description: data.description,
        }),
        headers: {
          authorization: data.userToken,
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.json();

    return result;
  },
  async searchMemes(data: SearchMemesProps): Promise<SearchMemesReturn> {
    const response = await fetch(
      `${workerService.apiUrl}/memes/search?q=${data.query}`,
      {
        method: "GET",
        headers: {
          authorization: data.userToken,
        },
      },
    );

    const result = await response.json();

    return result;
  },
};
