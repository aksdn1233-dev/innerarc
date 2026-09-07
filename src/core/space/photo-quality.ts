export const PHOTO_ISSUES = [
  "too_small",
  "underexposed",
  "overexposed",
  "low_contrast",
  "likely_blur",
  "low_information",
] as const;

export type PhotoIssue = (typeof PHOTO_ISSUES)[number];
export type PhotoQualityStatus = "good" | "review" | "unusable";
export type PhotoQuality = {
  width: number;
  height: number;
  megapixels: number;
  meanLuma: number;
  contrast: number;
  edgeEnergy: number;
  darkClipRatio: number;
  lightClipRatio: number;
  status: PhotoQualityStatus;
  issues: PhotoIssue[];
};

/**
 * Fast, deterministic pixel evidence check shared by browser previews and the server.
 * It does not claim that a photo is geometrically correct. It only prevents obviously
 * unusable pixels from being presented to the cross-view reconstruction step.
 */
export function assessPhotoPixels(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
): PhotoQuality {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || rgba.length < width * height * 4) {
    throw new Error("INVALID_PHOTO_PIXELS");
  }
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 180_000)));
  let count = 0, sum = 0, sumSquares = 0, dark = 0, light = 0, edge = 0, edgeCount = 0;
  let previousRow: number[] = [];
  for (let y = 0; y < height; y += step) {
    const row: number[] = [];
    let previous = -1;
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const luma = .2126 * Number(rgba[index]) + .7152 * Number(rgba[index + 1]) + .0722 * Number(rgba[index + 2]);
      row.push(luma); count++; sum += luma; sumSquares += luma * luma;
      if (luma <= 12) dark++;
      if (luma >= 245) light++;
      if (previous >= 0) { edge += Math.abs(luma - previous); edgeCount++; }
      const above = previousRow[row.length - 1];
      if (above !== undefined) { edge += Math.abs(luma - above); edgeCount++; }
      previous = luma;
    }
    previousRow = row;
  }
  const meanLuma = sum / count;
  const contrast = Math.sqrt(Math.max(0, sumSquares / count - meanLuma * meanLuma));
  const edgeEnergy = edgeCount ? edge / edgeCount : 0;
  const darkClipRatio = dark / count, lightClipRatio = light / count;
  const issues: PhotoIssue[] = [];
  if (Math.min(width, height) < 480 || Math.max(width, height) < 720) issues.push("too_small");
  if (meanLuma < 42 || darkClipRatio > .42) issues.push("underexposed");
  if (meanLuma > 225 || lightClipRatio > .52) issues.push("overexposed");
  if (contrast < 20) issues.push("low_contrast");
  if (edgeEnergy < 5) issues.push("likely_blur");
  if (contrast < 7 && edgeEnergy < 2.2) issues.push("low_information");
  const unusable = issues.includes("too_small") || issues.includes("low_information") ||
    (issues.includes("underexposed") && meanLuma < 22) || (issues.includes("overexposed") && meanLuma > 244);
  return {
    width,
    height,
    megapixels: Math.round(width * height / 10_000) / 100,
    meanLuma: Math.round(meanLuma * 10) / 10,
    contrast: Math.round(contrast * 10) / 10,
    edgeEnergy: Math.round(edgeEnergy * 10) / 10,
    darkClipRatio: Math.round(darkClipRatio * 10_000) / 10_000,
    lightClipRatio: Math.round(lightClipRatio * 10_000) / 10_000,
    status: unusable ? "unusable" : issues.length ? "review" : "good",
    issues,
  };
}

export function usablePhotoSet(qualities: readonly PhotoQuality[]): boolean {
  const usable = qualities.filter(item => item.status !== "unusable");
  return usable.length >= 2 && usable.some(item => item.status === "good");
}
