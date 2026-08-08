"use client";

import { useState } from "react";
import type { StoredReviewRow } from "@/core/reviews";
import { changedActionLabels, reviewTypeLabels } from "@/i18n/review-copy";

const STATUS_LABEL: Record<string, string> = {
  pending: "검토 대기",
  approved: "공개 중",
  rejected: "비공개 처리",
  withdrawn: "작성자 철회",
};

const PRODUCT_LABEL: Record<string, string> = {
  plus_30d: "코어(구)",
  pro_30d: "상세 리딩",
  premium_pdf: "프리미엄 심층 리딩",
};

export function AdminReviewList({
  available,
  reviews,
}: {
  available: boolean;
  reviews: readonly StoredReviewRow[];
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(reviews.map((review) => [review.id, review.admin_note])),
  );
  const [result, setResult] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(reviews.map((review) => [review.id, review.status])),
  );

  async function update(
    id: string,
    status: "approved" | "rejected" | "pending",
    reviewType?: "beta_participant",
  ) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(reviewType ? { reviewType } : {}),
          adminNote: notes[id] ?? "",
        }),
      });
      if (response.ok) setStatuses((current) => ({ ...current, [id]: status }));
      setResult((current) => ({
        ...current,
        [id]: response.ok ? `저장됨 · ${STATUS_LABEL[status] ?? status}` : "저장 실패",
      }));
    } catch {
      setResult((current) => ({ ...current, [id]: "저장 실패" }));
    } finally {
      setBusyId(null);
    }
  }

  if (!available) {
    return (
      <p className="admin-empty">
        후기 테이블이 아직 적용되지 않았습니다. <code>20260803000100_review_collection.sql</code>{" "}
        마이그레이션을 적용하면 이 목록이 열립니다.
      </p>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="admin-empty">
        아직 접수된 후기가 없습니다. 승인된 후기가 없는 동안 홈페이지에는 후기 카드 대신
        리포트 구성 예시와 자주 묻는 질문이 표시됩니다.
      </p>
    );
  }

  return (
    <div className="admin-review-list">
      {reviews.map((review) => {
        const status = statuses[review.id] ?? review.status;
        return (
          <article className="admin-review" key={review.id}>
            <header>
              <span className={`admin-badge is-${status}`}>
                {STATUS_LABEL[status] ?? status}
              </span>
              <strong>{reviewTypeLabels.ko[review.review_type]}</strong>
              <small>{new Date(review.created_at).toLocaleString("ko-KR")}</small>
            </header>
            <p className="admin-review-meta">
              {review.public_consent ? "공개 동의함" : "공개 미동의 — 승인해도 표시되지 않음"}
              {review.hide_product_context && " · 상품·1번 답변 비공개 요청"}
              {review.product_code && ` · ${PRODUCT_LABEL[review.product_code] ?? review.product_code}`}
              {review.order_id && <> · 주문 <code>{review.order_id}</code></>}
              {" · 표시 이름 "}
              <code>{review.display_name || "익명"}</code>
            </p>
            <dl className="admin-review-answers">
              <dt>알고 싶었던 것</dt>
              <dd>{review.wanted_to_understand}</dd>
              <dt>가장 도움이 된 부분</dt>
              <dd>{review.most_useful}</dd>
              {review.hard_to_understand && (
                <>
                  <dt>이해하기 어려웠던 부분</dt>
                  <dd>{review.hard_to_understand}</dd>
                </>
              )}
              <dt>행동 변화</dt>
              <dd>{changedActionLabels.ko[review.changed_action]}</dd>
            </dl>
            <label htmlFor={`review-note-${review.id}`}>검토 메모</label>
            <textarea
              id={`review-note-${review.id}`}
              maxLength={2_000}
              onChange={(event) =>
                setNotes((current) => ({ ...current, [review.id]: event.target.value }))}
              rows={2}
              value={notes[review.id] ?? ""}
            />
            <div className="admin-review-actions">
              <button
                className="secondary-button"
                disabled={busyId === review.id || !review.public_consent}
                onClick={() => void update(review.id, "approved")}
                type="button"
                title={review.public_consent ? undefined : "작성자가 공개에 동의하지 않았습니다."}
              >
                공개 승인
              </button>
              <button
                className="secondary-button"
                disabled={busyId === review.id}
                onClick={() => void update(review.id, "rejected")}
                type="button"
              >
                비공개 처리
              </button>
              <button
                className="secondary-button"
                disabled={busyId === review.id}
                onClick={() => void update(review.id, status === "approved" ? "approved" : "pending", "beta_participant")}
                type="button"
              >
                테스트 참여자로 표시
              </button>
              <span aria-live="polite">{result[review.id] ?? ""}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
