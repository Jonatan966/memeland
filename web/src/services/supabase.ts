import { createClient } from "@supabase/supabase-js";

export interface Meme {
  id: string;
  description: string;
  keywords: string[];
  file: string;
  type: string;
}

interface FindMemesProps {
  user_id: string;
  items_per_page: number;
  current_page?: number;
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

export const supabaseService = {
  async findMemes(
    { user_id, items_per_page, current_page = 0 }: FindMemesProps,
  ): Promise<{ data: Meme[]; count: number }> {
    const from = current_page * items_per_page;
    const to = from + items_per_page;

    const { data, count } = await supabase
      .from("memes")
      .select("id, description, keywords, file, type", { count: "exact" })
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(from + Number(from > 0), to);

    if (!data) {
      return { data: [], count: 0 };
    }

    return { data, count: count || 0 };
  },
};
