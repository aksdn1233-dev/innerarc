import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminPageContent } from "@/server/admin-content";
import { resolveAdminPageContent } from "@/server/admin-content";
import {
  OPERATIONAL_EVENT_NAMES,
  type OperationalEventName,
  type OperationalMetricRow,
} from "@/server/operational-metrics";

const BUCKET = "gyeol-operations";
const PAGE_CONTENT_PATH = "settings/page-content.json";
const FILE_PATTERN = /^(ko|en)--([a-z_]+)--([A-Za-z0-9:_-]+)--([0-9a-f-]{36})\.evt$/;

async function ensureBucket(admin: SupabaseClient) {
  const existing = await admin.storage.getBucket(BUCKET);
  if (!existing.error) return;
  const created = await admin.storage.createBucket(BUCKET, {
    public: false,
    allowedMimeTypes: ["application/json", "application/octet-stream"],
    fileSizeLimit: 65_536,
  });
  if (created.error && !/already exists/i.test(created.error.message)) {
    throw created.error;
  }
}

export async function readStoredPageContent(
  admin: SupabaseClient,
): Promise<AdminPageContent> {
  const downloaded = await admin.storage.from(BUCKET).download(PAGE_CONTENT_PATH);
  if (downloaded.error || !downloaded.data) return resolveAdminPageContent(null);
  try {
    return resolveAdminPageContent(JSON.parse(await downloaded.data.text()));
  } catch {
    return resolveAdminPageContent(null);
  }
}

export async function writeStoredPageContent(
  admin: SupabaseClient,
  content: AdminPageContent,
) {
  await ensureBucket(admin);
  const result = await admin.storage.from(BUCKET).upload(
    PAGE_CONTENT_PATH,
    new Blob([JSON.stringify(content)], { type: "application/json" }),
    { contentType: "application/json", upsert: true },
  );
  if (result.error) throw result.error;
}

export async function recordOperationalMetric(
  admin: SupabaseClient,
  input: Readonly<{
    metricDate: string;
    locale: "ko" | "en";
    eventName: OperationalEventName;
    dimension: string;
  }>,
) {
  await ensureBucket(admin);
  const filename = [
    input.locale,
    input.eventName,
    input.dimension,
    crypto.randomUUID(),
  ].join("--") + ".evt";
  const result = await admin.storage.from(BUCKET).upload(
    `metrics/${input.metricDate}/${filename}`,
    new Uint8Array([1]),
    { contentType: "application/octet-stream", upsert: false },
  );
  if (result.error) throw result.error;
}

export function parseOperationalMetricFile(
  metricDate: string,
  name: string,
): OperationalMetricRow | null {
  const match = FILE_PATTERN.exec(name);
  if (!match) return null;
  const eventName = match[2] as OperationalEventName;
  if (!OPERATIONAL_EVENT_NAMES.includes(eventName)) return null;
  return {
    metric_date: metricDate,
    locale: match[1] as "ko" | "en",
    event_name: eventName,
    dimension: match[3],
    count: 1,
  };
}

async function listMetricDay(admin: SupabaseClient, metricDate: string) {
  const rows: OperationalMetricRow[] = [];
  const limit = 1_000;
  for (let offset = 0; offset < 10_000; offset += limit) {
    const page = await admin.storage.from(BUCKET).list(`metrics/${metricDate}`, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (page.error) return { rows: [], available: false } as const;
    for (const file of page.data ?? []) {
      const parsed = parseOperationalMetricFile(metricDate, file.name);
      if (parsed) rows.push(parsed);
    }
    if ((page.data?.length ?? 0) < limit) break;
  }
  return { rows, available: true } as const;
}

export async function listOperationalMetrics(
  admin: SupabaseClient,
  metricDates: readonly string[],
) {
  const days = await Promise.all(metricDates.map((date) => listMetricDay(admin, date)));
  return {
    available: days.every((day) => day.available),
    rows: days.flatMap((day) => day.rows),
  };
}
