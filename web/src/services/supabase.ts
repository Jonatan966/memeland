import { createClient } from "@supabase/supabase-js";

export interface Meme {
  id: string;
  description: string;
  keywords: string[];
  file: string;
  type: string;
  width?: number;
  height?: number;
  index?: number;
  isDummy?: boolean;
}

export interface MemeOrderingConfig {
  by: "created_at" | "frequency";
  ascending: boolean;
}

interface FindMemesProps {
  user_id: string;
  items_per_page: number;
  current_page?: number;
  order?: MemeOrderingConfig;
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

export const supabaseService = {
  async findMemes(
    {
      user_id,
      items_per_page,
      current_page = 0,
      order = { by: "created_at", ascending: false },
    }: FindMemesProps,
  ): Promise<{ data: Meme[]; count: number }> {
    const from = current_page * items_per_page;
    const to = from + items_per_page;

    const { data, count } = await supabase
      .from("memes")
      .select("id, description, keywords, file, type, width, height", {
        count: "exact",
      })
      .eq("user_id", user_id)
      .order(order.by, { ascending: order.ascending })
      .range(from + Number(from > 0), to);

    if (!data) {
      return { data: [], count: 0 };
    }

    return { data, count: count || 0 };
  },
  async incrementFrequency(memeId: string) {
    const memeResponse = await supabase.from("memes").select("frequency")
      .eq(
        "id",
        memeId,
      );

    const targetMeme = memeResponse.data?.[0];

    if (!targetMeme) {
      return false;
    }

    await supabase.from("memes").update({
      frequency: targetMeme.frequency + 1,
    }).eq("id", memeId);
  },
};
