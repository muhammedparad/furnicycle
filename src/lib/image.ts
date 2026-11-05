/** Downscale a photo in the browser so uploads stay small (and fit in local storage). */
export async function compressImage(file: Blob, maxSide = 1400, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read image"))), "image/jpeg", quality),
  );
}

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

/** Small JPEG as base64 (no data: prefix) for the AI assistant. */
export async function imageForAi(src: Blob | string): Promise<string> {
  const file = typeof src === "string" ? await (await fetch(src)).blob() : src;
  const small = await compressImage(file, 768, 0.75);
  return (await blobToDataUrl(small)).split(",")[1];
}
