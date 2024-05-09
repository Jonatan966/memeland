import { Meme } from "./supabase";

interface SendMemeProps {
  description: string;
  keywords: string[];
  meme: File;
  userToken: string;
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
  async sendMeme(data: SendMemeProps) {
    const formData = new FormData();

    formData.append("method", "sendMeme");
    formData.append("description", data.description);
    formData.append("keywords", JSON.stringify(data.keywords));
    formData.append("meme", data.meme);

    const response = await fetch(import.meta.env.VITE_WORKER_URL, {
      method: "POST",
      body: formData,
      headers: {
        authorization: data.userToken,
        // "content-type": "multipart/form-data; boundary=X-WEB",
      },
    });

    const result = await response.json();

    return result;
  },
  async generateKeywords(
    data: GenerateKeywordsProps,
  ): Promise<GenerateKeywordsReturn> {
    const formData = new FormData();

    formData.append("method", "generateKeywords");
    formData.append("description", data.description);

    const response = await fetch(import.meta.env.VITE_WORKER_URL, {
      method: "POST",
      body: formData,
      headers: {
        authorization: data.userToken,
      },
    });

    const result = await response.json();

    return result;
  },
  async searchMemes(data: SearchMemesProps): Promise<SearchMemesReturn> {
    const formData = new FormData();

    formData.append("method", "searchMemes");
    formData.append("query", data.query);

    const response = await fetch(import.meta.env.VITE_WORKER_URL, {
      method: "POST",
      body: formData,
      headers: {
        authorization: data.userToken,
      },
    });

    const result = await response.json();

    return result;
  },
};
