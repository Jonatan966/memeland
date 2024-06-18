export async function copy(content: string | Blob) {
  if (content instanceof Blob) {
    if (!("ClipboardItem" in window)) {
      return false;
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    let parsedContent: Blob | Promise<Blob> = content;

    if (isSafari) {
      const makeImagePromise = async () => {
        return new Promise<Blob>((resolve) => resolve(content));
      };

      parsedContent = makeImagePromise();
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        [content.type]: parsedContent,
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
