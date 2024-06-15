import { Meme } from "@/services/supabase";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FileIcon } from "@radix-ui/react-icons";
import { MEME_LABELS, useMeme } from "@/hooks/use-meme";
import { useMemo, useRef } from "react";

interface MemeCardProps {
  meme: Meme;
  onSelect(): void;
}

export function MemeCard({ meme, onSelect }: MemeCardProps) {
  const memeImageRef = useRef<HTMLImageElement>(null);
  const fakeImageRef = useRef<HTMLImageElement>(null);

  const {
    memeHasCopySupport,
    memeFileExtension,
    onCopyMemeContent,
    onCopyMemeLink,
  } = useMeme(meme, memeImageRef);

  const fakeMemeImage = useMemo(() => {
    const reduceScale = 0.5;
    const canvas = document.createElement("canvas");

    canvas.width = (meme?.width || 500) * reduceScale;
    canvas.height = (meme?.height || 500) * reduceScale;

    return canvas.toDataURL("base64");
  }, [meme]);

  if (meme.isDummy) {
    return <img src={fakeMemeImage} alt="fake image" ref={fakeImageRef} />;
  }

  return (
    <div
      data-index={meme?.index}
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
          className="w-full"
          style={{ display: "none" }}
          onLoadedData={(event) => {
            fakeImageRef.current?.remove();
            event.currentTarget.style.display = "initial";
          }}
        />
      ) : (
        <>
          <img
            src={meme.file}
            alt="Photo"
            className="w-full"
            loading="lazy"
            crossOrigin="anonymous"
            ref={memeImageRef}
            onLoad={() => fakeImageRef.current?.remove()}
          />
        </>
      )}

      <img src={fakeMemeImage} alt="fake image" ref={fakeImageRef} />

      <div className="absolute inset-0 flex items-start">
        <Badge>{MEME_LABELS?.[meme.type]}</Badge>
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
