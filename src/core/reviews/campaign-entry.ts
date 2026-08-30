const RECEIPT_PATTERN = /^\[campaign-entry:v1;code=([a-z0-9_]{3,80});at=([^\]]+)](?:\n|$)/;

export type CampaignEntryReceipt = Readonly<{ code: string; enteredAt: string }>;

/**
 * A server-authored marker in the existing operator-only note records prize consent
 * without changing the public projection or requiring contact details. It is removable
 * after the draw retention window and cannot be authored through the review form.
 */
export function buildCampaignEntryReceipt(code: string, enteredAt: Date): string {
  if (!/^[a-z0-9_]{3,80}$/.test(code) || Number.isNaN(enteredAt.getTime())) return "";
  return `[campaign-entry:v1;code=${code};at=${enteredAt.toISOString()}]`;
}

export function readCampaignEntryReceipt(value: string): CampaignEntryReceipt | null {
  const match = RECEIPT_PATTERN.exec(value);
  if (!match?.[1] || !match[2]) return null;
  const parsed = new Date(match[2]);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString() !== match[2]) return null;
  return { code: match[1], enteredAt: match[2] };
}

export function operatorNoteWithoutCampaignReceipt(value: string): string {
  return value.replace(RECEIPT_PATTERN, "").trim();
}

export function preserveCampaignReceipt(existing: string, operatorNote: string): string {
  const receipt = readCampaignEntryReceipt(existing);
  const clean = operatorNoteWithoutCampaignReceipt(operatorNote);
  if (!receipt) return clean.slice(0, 2_000);
  const marker = buildCampaignEntryReceipt(receipt.code, new Date(receipt.enteredAt));
  const available = Math.max(0, 2_000 - marker.length - 1);
  return clean ? `${marker}\n${clean.slice(0, available)}` : marker;
}
