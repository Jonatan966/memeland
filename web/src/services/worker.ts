import { FileDimensions } from "@/utils/get-file-dimensions";
import Cookies from "js-cookie";
import { Meme } from "./supabase";

export interface User {
  id: string;
}

interface SendMemeProps {
  description: string;
  keywords: string[];
  meme: File;
  dimensions?: FileDimensions;
}

interface GenerateKeywordsProps {
  description: string;
}

interface SearchMemesProps {
  query: string;
}

interface ListMemesProps {
  itemsPerPage: number;
  currentPage?: number;
}

interface ListMemesReturn {
  count: number;
  hasNextPage: boolean;
  memes: Meme[];
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

interface AuthenticationResult {
  token: {
    data: string;
    expiresIn: number;
  };
  refreshToken: {
    data: string;
    expiresIn: number;
  };
}

export const auth = {
  tokenKey: "memeland-token",
  refreshTokenKey: "memeland-refresh-token",
  isRefreshing: false,
  queue: [] as ((token: string) => void)[],
  saveTokens(tokens: AuthenticationResult) {
    const now = Date.now();

    Cookies.set(auth.tokenKey, tokens.token.data, {
      expires: new Date(now + tokens.token.expiresIn),
    });

    Cookies.set(auth.refreshTokenKey, tokens.refreshToken.data, {
      expires: new Date(now + tokens.refreshToken.expiresIn),
    });
  },
  async getToken(): Promise<string> {
    if (auth.isRefreshing) {
      return new Promise((resolve) => {
        auth.queue.push(resolve);
      });
    }

    const token = Cookies.get(auth.tokenKey);

    if (token) {
      return `Bearer ${token}`;
    }

    const refreshToken = Cookies.get(auth.refreshTokenKey);

    if (!refreshToken) {
      // TODO: Deal with possible errors
      return "";
    }

    auth.isRefreshing = true;

    const newTokens = await workerService.refreshTokens(
      `Bearer ${refreshToken}`
    );

    auth.saveTokens(newTokens);

    auth.queue.forEach((item) => item(newTokens.token.data));

    auth.isRefreshing = false;

    return `Bearer ${newTokens.token.data}`;
  },
  clearTokens() {
    Cookies.remove(auth.tokenKey);
    Cookies.remove(auth.refreshTokenKey);
  },
};

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
        authorization: await auth.getToken(),
      },
    });

    const result = await response.json();

    return result;
  },
  async generateKeywords(
    data: GenerateKeywordsProps
  ): Promise<GenerateKeywordsReturn> {
    const response = await fetch(`${workerService.apiUrl}/keywords`, {
      method: "POST",
      body: JSON.stringify({
        description: data.description,
      }),
      headers: {
        authorization: await auth.getToken(),
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    return result;
  },
  async searchMemes(data: SearchMemesProps): Promise<SearchMemesReturn> {
    const response = await fetch(
      `${workerService.apiUrl}/memes/search?q=${data.query}`,
      {
        method: "GET",
        headers: {
          authorization: await auth.getToken(),
        },
      }
    );

    const result = await response.json();

    return result;
  },
  async listMemes(props: ListMemesProps): Promise<ListMemesReturn> {
    const response = await fetch(
      `${workerService.apiUrl}/memes?page=${props.currentPage}&take=${props.itemsPerPage}`,
      {
        method: "GET",
        headers: {
          authorization: await auth.getToken(),
        },
      }
    );

    const result = await response.json();

    return result;
  },
  async incrementMemeFrequency(memeId: string) {
    await fetch(`${workerService.apiUrl}/memes/${memeId}/frequency`, {
      method: "PUT",
      headers: {
        authorization: await auth.getToken(),
      },
    });
  },
  async authenticate(code: string): Promise<void> {
    const response = await fetch(`${workerService.apiUrl}/auth`, {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    auth.saveTokens(result);
  },
  async refreshTokens(refreshToken: string): Promise<AuthenticationResult> {
    const response = await fetch(`${workerService.apiUrl}/auth/refresh`, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    return result;
  },
  async getUserInfo(): Promise<User | undefined> {
    const token = await auth.getToken();

    if (!token) {
      return;
    }

    const response = await fetch(`${workerService.apiUrl}/auth/me`, {
      method: "GET",
      headers: {
        authorization: token,
      },
    });

    const result = await response.json();

    return result;
  },
};
