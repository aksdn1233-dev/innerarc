import { describe, expect, it } from "vitest";
import {
  AccountDataRightsService,
  InMemoryOwnedDataStore,
  type OwnedDataStore,
} from "@/core/account";

const ownerRef = "account_12345678";
const otherOwnerRef = "account_87654321";
const now = "2026-07-22T10:00:00.000Z";

const record = (overrides: Record<string, unknown> = {}) => ({
  recordRef: "profile_12345678",
  ownerRef,
  collection: "profile",
  subject: "owner",
  createdAt: "2026-07-20T10:00:00.000Z",
  data: { birthDate: "1994-11-04", romanizedName: "Minji Kim", locale: "ko" },
  ...overrides,
});

describe("owner data export", () => {
  it("exports the requesting owner's sensitive records in a versioned deterministic bundle", async () => {
    const store = new InMemoryOwnedDataStore([
      record({
        recordRef: "reality_12345678",
        collection: "reality_check",
        createdAt: "2026-07-21T10:00:00.000Z",
        data: { question: "What should I verify?", outcome: "I waited." },
      }),
      record(),
      record({ recordRef: "profile_87654321", ownerRef: otherOwnerRef }),
    ]);
    const service = new AccountDataRightsService(store);
    const bundle = await service.exportData({ ownerRef, requestId: "export_12345678", exportedAt: now });
    expect(bundle.schemaVersion).toBe("1.0.0");
    expect(bundle.records).toHaveLength(2);
    expect(bundle.records.map(({ collection }) => collection)).toEqual(["profile", "reality_check"]);
    expect(JSON.stringify(bundle)).toContain("1994-11-04");
    expect(JSON.stringify(bundle)).not.toContain(otherOwnerRef);
    expect(bundle.records.every((item) => !("ownerRef" in item))).toBe(true);
  });

  it("returns an empty bundle and replays the same export request", async () => {
    const service = new AccountDataRightsService(new InMemoryOwnedDataStore([]));
    const first = await service.exportData({ ownerRef, requestId: "export_12345678", exportedAt: now });
    const replay = await service.exportData({ ownerRef, requestId: "export_12345678", exportedAt: "2026-07-23T10:00:00.000Z" });
    expect(first.records).toEqual([]);
    expect(replay).toEqual(first);
  });

  it("fails closed when a storage adapter leaks another owner", async () => {
    const maliciousStore: OwnedDataStore = {
      async listForOwner() { return [record({ ownerRef: otherOwnerRef })]; },
      async deleteForOwner() { return {}; },
    };
    await expect(new AccountDataRightsService(maliciousStore).exportData({
      ownerRef,
      requestId: "export_12345678",
      exportedAt: now,
    })).rejects.toThrow("DATA_EXPORT_OWNER_MISMATCH");
  });

  it("rejects malformed JSON payloads and duplicate record references", () => {
    expect(() => new InMemoryOwnedDataStore([record({ data: { value: Number.NaN } })])).toThrow();
    expect(() => new InMemoryOwnedDataStore([record(), record()])).toThrow("DUPLICATE_DATA_RECORD");
  });
});

describe("scoped deletion", () => {
  it("removes only third-party relationship data when requested", async () => {
    const store = new InMemoryOwnedDataStore([
      record(),
      record({
        recordRef: "relationship_12345678",
        collection: "relationship",
        subject: "third_party",
        data: { label: "Partner", birthDate: "1990-01-02" },
      }),
      record({ recordRef: "profile_87654321", ownerRef: otherOwnerRef }),
    ]);
    const service = new AccountDataRightsService(store);
    const deletion = await service.deleteData({
      ownerRef,
      requestId: "delete_12345678",
      scope: "third_party",
      completedAt: now,
    });
    expect(deletion).toMatchObject({
      totalDeleted: 1,
      deletedByCollection: { relationship: 1 },
      duplicate: false,
    });
    const ownerExport = await service.exportData({ ownerRef, requestId: "export_12345678", exportedAt: now });
    expect(ownerExport.records.map(({ collection }) => collection)).toEqual(["profile"]);
    const otherExport = await service.exportData({ ownerRef: otherOwnerRef, requestId: "export_87654321", exportedAt: now });
    expect(otherExport.records).toHaveLength(1);
  });

  it("deletes every owned record and makes retry idempotent", async () => {
    const store = new InMemoryOwnedDataStore([
      record(),
      record({ recordRef: "tarot_12345678", collection: "tarot", data: { cards: ["major-00"] } }),
    ]);
    const service = new AccountDataRightsService(store);
    const request = { ownerRef, requestId: "delete_12345678", scope: "all_data" as const, completedAt: now };
    expect(await service.deleteData(request)).toMatchObject({ totalDeleted: 2, duplicate: false });
    expect(await service.deleteData(request)).toMatchObject({ totalDeleted: 2, duplicate: true });
    const bundle = await service.exportData({ ownerRef, requestId: "export_12345678", exportedAt: now });
    expect(bundle.records).toEqual([]);
  });

  it("rejects request-ID reuse across owner or scope", async () => {
    const service = new AccountDataRightsService(new InMemoryOwnedDataStore([]));
    await service.deleteData({ ownerRef, requestId: "delete_12345678", scope: "third_party", completedAt: now });
    await expect(service.deleteData({
      ownerRef,
      requestId: "delete_12345678",
      scope: "all_data",
      completedAt: now,
    })).rejects.toThrow("DATA_RIGHTS_IDEMPOTENCY_CONFLICT");
  });

  it("rejects impossible deletion counts from an adapter", async () => {
    const invalidStore: OwnedDataStore = {
      async listForOwner() { return []; },
      async deleteForOwner() { return { tarot: -1 }; },
    };
    await expect(new AccountDataRightsService(invalidStore).deleteData({
      ownerRef,
      requestId: "delete_12345678",
      scope: "all_data",
      completedAt: now,
    })).rejects.toThrow();
  });
});
