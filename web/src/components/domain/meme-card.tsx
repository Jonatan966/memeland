import { Meme } from "@/services/supabase";
import { Badge } from "../ui/badge";

interface MemeCardProps {
  meme: Meme;
}

export function MemeCard({ meme }: MemeCardProps) {
  const fileUrl = `${
    import.meta.env.VITE_SUPABASE_URL
  }/storage/v1/object/public/memes/${meme.file}`;

  return (
    <div
      className="relative cursor-pointer border hover:border-green-500 mb-4"
      onClick={() => alert("card")}
    >
      <img src={fileUrl} alt="Photo" className="w-full aspect-square" />

      <div className="absolute inset-0 flex items-start">
        <Badge>Imagem</Badge>
      </div>
      {/* <div className="absolute inset-0 opacity-0 hover:opacity-100">
        <button>Botão</button>
      </div> */}
    </div>
  );
}
