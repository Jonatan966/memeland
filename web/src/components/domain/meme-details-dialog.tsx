import { Meme } from "@/services/worker";
import { Dialog, DialogContent } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useMeme } from "@/hooks/use-meme";
import { FileIcon } from "@radix-ui/react-icons";
import { useRef } from "react";

interface MemeDetailsDialogProps {
  meme: Meme | null;
  onClose(): void;
  isOpen: boolean;
}

export function MemeDetailsDialog({
  meme,
  isOpen,
  onClose,
}: MemeDetailsDialogProps) {
  const memeImageRef = useRef<HTMLImageElement>(null);

  const {
    memeHasCopySupport,
    memeFileExtension,
    onCopyMemeContent,
    onCopyMemeLink,
  } = useMeme(meme, memeImageRef);

  if (!meme) {
    return <></>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 sm:grid flex flex-col grid-cols-2 w-full max-w-3xl">
        {memeFileExtension === "mp4" ? (
          <video
            src={meme.file}
            className="h-full w-full max-h-[50svh]"
            onLoadStart={(e) => (e.currentTarget.volume = 0.5)}
            controls
          />
        ) : (
          <img
            src={meme.file}
            className="h-full w-full bg-black max-h-[50svh] object-contain"
            loading="lazy"
          />
        )}

        <div className="p-6 flex flex-col max-sm:pt-0">
          <div className="mb-2">
            <strong className="text-sm font-medium leading-none">
              Descrição
            </strong>
            <p className="leading-relaxed text-muted-foreground">
              {meme.description}
            </p>
          </div>

          <div>
            <strong className="text-sm font-medium leading-none">
              Palavras-chave
            </strong>
            <div className="flex flex-wrap gap-1">
              {meme.keywords.map((keyword) => (
                <Badge key={keyword}>{keyword}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-auto flex gap-1 pt-2">
            {memeHasCopySupport && (
              <Button
                size="icon"
                variant="secondary"
                className="h-8"
                onClick={onCopyMemeContent}
                title="Copiar arquivo do meme"
              >
                <FileIcon />
              </Button>
            )}

            <Button size="sm" className="w-full h-8" onClick={onCopyMemeLink}>
              Copiar link do meme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
