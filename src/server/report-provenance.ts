import { createHash, createHmac, randomUUID } from "node:crypto";

export const REPORT_PROVENANCE_VERSION = "report-provenance-1.0.0" as const;

export type ReportProvenance = Readonly<{
  version: typeof REPORT_PROVENANCE_VERSION;
  reportId: string;
  provenanceId: string;
  exportId: string;
  contentFingerprint: string;
  canaryMarker: null;
}>;

function secretFrom(environment: Readonly<Record<string, string | undefined>>): string | null {
  const value = environment.PROVENANCE_HMAC_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}
function opaque(secret: string, namespace: string, value: string): string {
  return createHmac("sha256", secret).update(`${namespace}:${value}`).digest("hex").slice(0, 24);
}

export function createReportProvenance(input: {
  reportId: string;
  ownerScope: string;
  content: string;
  environment?: Readonly<Record<string, string | undefined>>;
  exportId?: string;
}): ReportProvenance | null {
  const environment = input.environment ?? process.env;
  const secret = secretFrom(environment);
  if (!secret) return null;
  const exportId = input.exportId ?? `exp_${randomUUID().replaceAll("-", "")}`;
  const contentDigest = createHash("sha256").update(input.content).digest("hex");
  return {
    version: REPORT_PROVENANCE_VERSION,
    reportId: input.reportId,
    provenanceId: `prv_${opaque(secret, "owner-report", `${input.ownerScope}:${input.reportId}`)}`,
    exportId,
    contentFingerprint: `fp_${opaque(secret, "content", contentDigest)}`,
    // Hook reserved for privacy-reviewed, non-semantic markers. P0 deliberately
    // carries no deceptive or user-visible canary content.
    canaryMarker: null,
  };
}

export function provenanceMetaTags(value: ReportProvenance): string {
  const attributes = [
    ["taeryeongdang:provenance-version", value.version],
    ["taeryeongdang:report-id", value.reportId],
    ["taeryeongdang:provenance-id", value.provenanceId],
    ["taeryeongdang:export-id", value.exportId],
    ["taeryeongdang:content-fingerprint", value.contentFingerprint],
  ];
  return attributes
    .map(([name, content]) => `<meta name="${name}" content="${content}">`)
    .join("");
}
