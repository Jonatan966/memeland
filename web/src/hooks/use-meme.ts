import { Meme, supabaseService } from "@/services/supabase";
import { convertImageToBlob } from "@/utils/convert-image-to-blob";
import { copy } from "@/utils/copy";
import { getFileExtension } from "@/utils/get-file-extension";
import { MouseEvent, RefObject } from "react";
import { toast } from "sonner";

export const MEME_LABELS = {
  image: "Imagem",
  video: "Vídeo",
  gif: "GIF",
} as Record<string, string>;

const SUPPORTED_MEME_TYPES_TO_COPY = ["png", "jpg", "jpeg", "webp"];

export function useMeme(
  meme?: Meme | null,
  memeImageRef?: RefObject<HTMLImageElement>,
) {
  const memeFileUrl = meme?.file || "";

  const memeFileExtension = getFileExtension(memeFileUrl);
  const memeHasCopySupport = SUPPORTED_MEME_TYPES_TO_COPY.includes(
    memeFileExtension,
  );

  function _onFinishCopy(hasCopy: boolean) {
    if (!hasCopy) {
      return "Não foi possível copiar :(";
    }

    if (meme?.id) {
      supabaseService.incrementFrequency(meme.id);
    }

    return "Copiado com sucesso!";
  }

  async function onCopyMemeLink(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    toast.promise(copy(memeFileUrl), {
      success: _onFinishCopy,
      error:
        "A ação de copiar não está disponível no momento em seu navegador :(",
      position: "bottom-center",
    });
  }

  async function onCopyMemeContent(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    let blob: Blob | null = null;

    if (memeFileExtension !== "png") {
      blob = await convertImageToBlob(memeImageRef?.current || memeFileUrl);
    } else {
      const fileResponse = await fetch(memeFileUrl);
      blob = await fileResponse.blob();
    }

    if (!blob) {
      toast.error("Não foi possível copiar :(");
      return;
    }

    toast.promise(copy(blob), {
      success: _onFinishCopy,
      error: (error) => {
        console.log(error);
        return "A ação de copiar não está disponível no momento em seu navegador :(";
      },
      loading: "Copiando...",
      position: "bottom-center",
    });
  }

  return {
    memeHasCopySupport,
    memeFileExtension,
    onCopyMemeLink,
    onCopyMemeContent,
  };
}
