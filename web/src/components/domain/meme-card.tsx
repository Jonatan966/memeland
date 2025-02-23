import { Meme } from "@/services/worker";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FileIcon, SunIcon } from "@radix-ui/react-icons";
import { MEME_LABELS, useMeme } from "@/hooks/use-meme";
import { SyntheticEvent, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface MemeCardProps {
  meme: Meme;
  onSelect(): void;
}

export function MemeCard({ meme, onSelect }: MemeCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isOnDesktop = useMediaQuery(["(max-width: 639px)"]);

  const memeImageRef = useRef<HTMLImageElement>(null);

  const {
    memeHasCopySupport,
    memeFileExtension,
    onCopyMemeContent,
    onCopyMemeLink,
  } = useMeme(meme, memeImageRef);

  function onLoadMeme(e: SyntheticEvent<HTMLElement>) {
    e.currentTarget.style.opacity = "initial";
    setIsLoading(false);
  }

  return (
    <div
      data-index={meme?.index}
      className={cn(
        "relative cursor-pointer bg-border border hover:border-green-500 group h-48",
        {
          "pointer-events-none": isLoading,
        }
      )}
      onClick={onSelect}
    >
      {isLoading && (
        <div className="h-full w-full flex">
          <SunIcon className="animate-spin m-auto w-8 h-8" />
        </div>
      )}
      {memeFileExtension === "mp4" ? (
        <video
          src={meme.file}
          muted
          loop
          autoPlay={!!isOnDesktop}
          controls={false}
          preload="none"
          className="w-full h-full pointer-events-none"
          style={{ opacity: 0 }}
          onLoadedData={onLoadMeme}
        />
      ) : (
        <>
          <img
            src={meme.file}
            alt="Photo"
            className="w-full h-full object-contain"
            loading="lazy"
            crossOrigin="anonymous"
            ref={memeImageRef}
            style={{ opacity: 0 }}
            onLoad={onLoadMeme}
          />
        </>
      )}

      <div className="absolute inset-0 flex items-start">
        <Badge>{MEME_LABELS?.[meme.type]}</Badge>
      </div>
      <div className="absolute bottom-1 left-1 right-1 opacity-0 flex gap-1 group-hover:opacity-100">
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
