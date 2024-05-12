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
  memeFileUrl = "",
  memeImageRef?: RefObject<HTMLImageElement>,
) {
  const memeFileExtension = getFileExtension(memeFileUrl);
  const memeHasCopySupport = SUPPORTED_MEME_TYPES_TO_COPY.includes(
    memeFileExtension,
  );

  async function onCopyMemeLink(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    toast.promise(copy(memeFileUrl), {
      success: (hasCopy) =>
        hasCopy ? "Copiado com sucesso!" : "Não foi possível copiar :(",
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
      success: (hasCopy) =>
        hasCopy ? "Copiado com sucesso!" : "Não foi possível copiar :(",
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
