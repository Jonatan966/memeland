export async function convertImageToBlob(
  imageUrl: string | HTMLImageElement,
) {
  return new Promise<Blob | null>((resolve, reject) => {
    function onProcess(image: HTMLImageElement) {
      const canvas = document.createElement("canvas");

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");

      context?.drawImage(image, 0, 0);

      canvas.toBlob(resolve, "image/png");
    }

    if (typeof imageUrl === "string") {
      const image = new Image();

      image.setAttribute("crossOrigin", "anonymous");

      image.onload = () => onProcess(image);

      image.onerror = reject;

      image.src = imageUrl;
    } else {
      onProcess(imageUrl);
    }
  });
}
