import {
  RealityCheckConflictError,
  type OutcomeReviewDraft,
  type RealityCheckRecord,
} from "./types";
import { addOutcomeReview } from "./engine";

export interface RealityCheckRepository {
  list(): RealityCheckRecord[];
  create(record: RealityCheckRecord): RealityCheckRecord;
  review(
    id: string,
    draft: OutcomeReviewDraft,
    reviewedAt: string,
    reviewedMonth?: string,
  ): RealityCheckRecord;
  remove(id: string): boolean;
  replace(records: RealityCheckRecord[]): void;
}

function clone(record: RealityCheckRecord): RealityCheckRecord {
  return structuredClone(record);
}

export class InMemoryRealityCheckRepository implements RealityCheckRepository {
  private records = new Map<string, RealityCheckRecord>();
  private createRequests = new Map<string, string>();
  private reviewRequests = new Map<string, string>();

  constructor(initial: RealityCheckRecord[] = []) {
    this.replace(initial);
  }

  list(): RealityCheckRecord[] {
    return [...this.records.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  }

  create(record: RealityCheckRecord): RealityCheckRecord {
    const priorId = this.createRequests.get(record.clientRequestId);
    if (priorId) return clone(this.records.get(priorId)!);
    if (this.records.has(record.id)) {
      throw new RealityCheckConflictError(`Record ${record.id} already exists.`);
    }
    this.records.set(record.id, clone(record));
    this.createRequests.set(record.clientRequestId, record.id);
    return clone(record);
  }

  review(
    id: string,
    draft: OutcomeReviewDraft,
    reviewedAt: string,
    reviewedMonth?: string,
  ): RealityCheckRecord {
    const priorId = this.reviewRequests.get(draft.clientRequestId);
    if (priorId) {
      if (priorId !== id) throw new RealityCheckConflictError("Review request ID belongs to another record.");
      return clone(this.records.get(id)!);
    }
    const current = this.records.get(id);
    if (!current) throw new RealityCheckConflictError(`Record ${id} was not found.`);
    const reviewed = addOutcomeReview(current, draft, reviewedAt, reviewedMonth);
    this.records.set(id, reviewed);
    this.reviewRequests.set(draft.clientRequestId, id);
    return clone(reviewed);
  }

  remove(id: string): boolean {
    const record = this.records.get(id);
    if (!record) return false;
    this.records.delete(id);
    this.createRequests.delete(record.clientRequestId);
    if (record.review) this.reviewRequests.delete(record.review.clientRequestId);
    return true;
  }

  replace(records: RealityCheckRecord[]): void {
    this.records.clear();
    this.createRequests.clear();
    this.reviewRequests.clear();
    for (const record of records) {
      if (this.records.has(record.id) || this.createRequests.has(record.clientRequestId)) {
        throw new RealityCheckConflictError("Imported records contain duplicate IDs or request IDs.");
      }
      this.records.set(record.id, clone(record));
      this.createRequests.set(record.clientRequestId, record.id);
      if (record.review) {
        if (this.reviewRequests.has(record.review.clientRequestId)) {
          throw new RealityCheckConflictError("Imported reviews contain duplicate request IDs.");
        }
        this.reviewRequests.set(record.review.clientRequestId, record.id);
      }
    }
  }
}
