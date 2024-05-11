import { Meme } from "@/services/supabase";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FileIcon } from "@radix-ui/react-icons";
import { useMeme } from "@/hooks/use-meme";

interface MemeCardProps {
  meme: Meme;
  onSelect(): void;
}

export function MemeCard({ meme, onSelect }: MemeCardProps) {
  const {
    memeHasCopySupport,
    memeTypeLabel,
    memeFileExtension,
    onCopyMemeContent,
    onCopyMemeLink,
  } = useMeme(meme.file);

  return (
    <div
      className="relative cursor-pointer border hover:border-green-500 mb-4 group"
      onClick={onSelect}
    >
      {memeFileExtension === "mp4" ? (
        <video
          src={meme.file}
          muted
          loop
          autoPlay
          preload="none"
          className="w-full aspect-square"
        />
      ) : (
        <img
          src={meme.file}
          alt="Photo"
          className="w-full aspect-square"
          loading="lazy"
        />
      )}

      <div className="absolute inset-0 flex items-start">
        <Badge>{memeTypeLabel}</Badge>
      </div>
      <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
        {memeHasCopySupport && (
          <Button
            size="icon"
            variant="secondary"
            className="h-8"
            onClick={onCopyMemeContent}
          >
            <FileIcon />
          </Button>
        )}

        <Button size="sm" className="w-full h-8" onClick={onCopyMemeLink}>
          Copiar link do meme
        </Button>
      </div>
    </div>
  );
}
