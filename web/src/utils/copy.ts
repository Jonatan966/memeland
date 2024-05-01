export async function copy(content: string | Blob) {
  if (content instanceof Blob) {
    if (!("ClipboardItem" in window)) {
      return false;
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        [content.type]: content,
      }),
    ]);

    return true;
  }

  if (!window.isSecureContext || !("clipboard" in navigator)) {
    return false;
  }

  await navigator.clipboard.writeText(content);

  return true;
}
