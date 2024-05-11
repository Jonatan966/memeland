import { copy } from "@/utils/copy";
import { getFileExtension } from "@/utils/get-file-extension";
import { MouseEvent } from "react";
import { toast } from "sonner";

const MEME_LABELS_PER_TYPE = {
  png: "Imagem",
  jpg: "Imagem",
  jpeg: "Imagem",
  gif: "GIF",
  mp4: "Vídeo",
} as Record<string, string>;

const SUPPORTED_MEME_TYPES_TO_COPY = ["png"];

export function useMeme(memeFileUrl = "") {
  const memeFileExtension = getFileExtension(memeFileUrl);
  const memeHasCopySupport = SUPPORTED_MEME_TYPES_TO_COPY.includes(
    memeFileExtension,
  );

  const memeTypeLabel = MEME_LABELS_PER_TYPE?.[memeFileExtension] ||
    memeFileExtension;

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

    const fileResponse = await fetch(memeFileUrl);
    const blob = await fileResponse.blob();

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
    memeTypeLabel,
    memeFileExtension,
    onCopyMemeLink,
    onCopyMemeContent,
  };
}
