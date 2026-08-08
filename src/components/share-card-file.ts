export const SHARE_CARD_PNG_WIDTH = 1080;
export const SHARE_CARD_PNG_HEIGHT = 1350;

export async function renderShareCardPng(svg: string): Promise<Blob> {
  const source = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const sourceUrl = URL.createObjectURL(source);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The share-card SVG could not be decoded."));
      image.src = sourceUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = SHARE_CARD_PNG_WIDTH;
    canvas.height = SHARE_CARD_PNG_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("A 2D canvas is required to render the share card.");
    context.drawImage(image, 0, 0, SHARE_CARD_PNG_WIDTH, SHARE_CARD_PNG_HEIGHT);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The share-card PNG could not be encoded."));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function downloadShareFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  queueMicrotask(() => URL.revokeObjectURL(url));
}

export function isShareCancellation(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "name" in error
    && error.name === "AbortError";
}
