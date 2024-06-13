export interface FileDimensions {
  width: number;
  height: number;
}

export async function getFileDimensions(file: File) {
  return new Promise<FileDimensions | undefined>((resolve, reject) => {
    const fileObjectURL = URL.createObjectURL(file);

    if (file.type.includes("video")) {
      const video = document.createElement("video");
      video.src = fileObjectURL;

      video.onloadedmetadata = () =>
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
        });

      video.load();

      return;
    }

    const img = document.createElement("img");
    img.src = img.src = URL.createObjectURL(file);

    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(null);
  });
}
