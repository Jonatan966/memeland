export function getFileExtension(fileUrl: string) {
  return fileUrl.substring(fileUrl.lastIndexOf(".") + 1);
}
