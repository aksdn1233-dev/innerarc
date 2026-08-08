import { z } from "zod";

export const DATA_EXPORT_SCHEMA_VERSION = "1.0.0" as const;
export const DATA_DELETION_POLICY_VERSION = "1.0.0" as const;
const opaqueRef = z.string().regex(/^[A-Za-z0-9_-]{8,160}$/);

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() => z.union([
  z.null(),
  z.boolean(),
  z.number().finite(),
  z.string(),
  z.array(JsonValueSchema),
  z.record(z.string(), JsonValueSchema),
]));

export const DataCollectionSchema = z.enum([
  "profile",
  "consent",
  "numerology",
  "tarot",
  "question",
  "reality_check",
  "relationship",
  "ai_run",
]);
export type DataCollection = z.infer<typeof DataCollectionSchema>;

export const OwnedDataRecordSchema = z.object({
  recordRef: opaqueRef,
  ownerRef: opaqueRef,
  collection: DataCollectionSchema,
  subject: z.enum(["owner", "third_party"]),
  createdAt: z.string().datetime({ offset: true }),
  data: z.record(z.string(), JsonValueSchema),
}).strict();
export type OwnedDataRecord = z.infer<typeof OwnedDataRecordSchema>;

export type DataDeletionScope = "all_data" | "third_party";

export interface OwnedDataStore {
  listForOwner(ownerRef: string): Promise<readonly unknown[]>;
  deleteForOwner(ownerRef: string, scope: DataDeletionScope): Promise<Readonly<Partial<Record<DataCollection, number>>>>;
}

export const DataExportBundleSchema = z.object({
  schemaVersion: z.literal(DATA_EXPORT_SCHEMA_VERSION),
  ownerRef: opaqueRef,
  exportedAt: z.string().datetime({ offset: true }),
  records: z.array(OwnedDataRecordSchema.omit({ ownerRef: true })),
}).strict();
export type DataExportBundle = z.infer<typeof DataExportBundleSchema>;

export type DataDeletionResult = Readonly<{
  policyVersion: typeof DATA_DELETION_POLICY_VERSION;
  requestId: string;
  ownerRef: string;
  scope: DataDeletionScope;
  completedAt: string;
  deletedByCollection: Readonly<Partial<Record<DataCollection, number>>>;
  totalDeleted: number;
  duplicate: boolean;
}>;

type StoredRequest<Result> = { fingerprint: string; result: Result };

export class AccountDataRightsService {
  readonly #exports = new Map<string, StoredRequest<DataExportBundle>>();
  readonly #deletions = new Map<string, StoredRequest<DataDeletionResult>>();

  constructor(private readonly store: OwnedDataStore) {}

  async exportData(candidate: {
    ownerRef: string;
    requestId: string;
    exportedAt: string;
  }): Promise<DataExportBundle> {
    const ownerRef = opaqueRef.parse(candidate.ownerRef);
    const requestId = opaqueRef.parse(candidate.requestId);
    const exportedAt = z.string().datetime({ offset: true }).parse(candidate.exportedAt);
    const fingerprint = `${ownerRef}:export`;
    const existing = this.#exports.get(requestId);
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new Error("DATA_RIGHTS_IDEMPOTENCY_CONFLICT");
      return existing.result;
    }
    const records = (await this.store.listForOwner(ownerRef)).map((record) => OwnedDataRecordSchema.parse(record));
    for (const record of records) {
      if (record.ownerRef !== ownerRef) throw new Error("DATA_EXPORT_OWNER_MISMATCH");
    }
    const bundle = DataExportBundleSchema.parse({
      schemaVersion: DATA_EXPORT_SCHEMA_VERSION,
      ownerRef,
      exportedAt,
      records: records
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.recordRef.localeCompare(b.recordRef))
        .map((record) => ({
          recordRef: record.recordRef,
          collection: record.collection,
          subject: record.subject,
          createdAt: record.createdAt,
          data: record.data,
        })),
    });
    this.#exports.set(requestId, { fingerprint, result: bundle });
    return bundle;
  }

  async deleteData(candidate: {
    ownerRef: string;
    requestId: string;
    scope: DataDeletionScope;
    completedAt: string;
  }): Promise<DataDeletionResult> {
    const ownerRef = opaqueRef.parse(candidate.ownerRef);
    const requestId = opaqueRef.parse(candidate.requestId);
    const scope = z.enum(["all_data", "third_party"]).parse(candidate.scope);
    const completedAt = z.string().datetime({ offset: true }).parse(candidate.completedAt);
    const fingerprint = `${ownerRef}:${scope}`;
    const existing = this.#deletions.get(requestId);
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new Error("DATA_RIGHTS_IDEMPOTENCY_CONFLICT");
      return { ...existing.result, duplicate: true };
    }
    const rawCounts = await this.store.deleteForOwner(ownerRef, scope);
    const deletedByCollection: Partial<Record<DataCollection, number>> = {};
    for (const [rawCollection, rawCount] of Object.entries(rawCounts)) {
      const collection = DataCollectionSchema.parse(rawCollection);
      const count = z.number().int().min(0).parse(rawCount);
      if (count > 0) deletedByCollection[collection] = count;
    }
    const result: DataDeletionResult = {
      policyVersion: DATA_DELETION_POLICY_VERSION,
      requestId,
      ownerRef,
      scope,
      completedAt,
      deletedByCollection,
      totalDeleted: Object.values(deletedByCollection).reduce((sum, count) => sum + (count ?? 0), 0),
      duplicate: false,
    };
    this.#deletions.set(requestId, { fingerprint, result });
    return result;
  }
}

export class InMemoryOwnedDataStore implements OwnedDataStore {
  readonly #records = new Map<string, OwnedDataRecord>();

  constructor(records: readonly unknown[]) {
    for (const candidate of records) {
      const record = OwnedDataRecordSchema.parse(candidate);
      if (this.#records.has(record.recordRef)) throw new Error(`DUPLICATE_DATA_RECORD:${record.recordRef}`);
      this.#records.set(record.recordRef, record);
    }
  }

  async listForOwner(ownerRef: string): Promise<readonly OwnedDataRecord[]> {
    return [...this.#records.values()].filter((record) => record.ownerRef === ownerRef);
  }

  async deleteForOwner(ownerRef: string, scope: DataDeletionScope): Promise<Readonly<Partial<Record<DataCollection, number>>>> {
    const counts: Partial<Record<DataCollection, number>> = {};
    for (const [recordRef, record] of this.#records) {
      if (record.ownerRef !== ownerRef) continue;
      if (scope === "third_party" && record.subject !== "third_party") continue;
      this.#records.delete(recordRef);
      counts[record.collection] = (counts[record.collection] ?? 0) + 1;
    }
    return counts;
  }
}
