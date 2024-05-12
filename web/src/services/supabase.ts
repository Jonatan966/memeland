import { createClient } from "@supabase/supabase-js";

export interface Meme {
  id: string;
  description: string;
  keywords: string[];
  file: string;
  type: string;
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

export const supabaseService = {
  async findMemes(user_id: string): Promise<Meme[]> {
    const { data } = await supabase
      .from("memes")
      .select("id, description, keywords, file, type")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (!data) {
      return [];
    }

    return data;
  },
};
