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
