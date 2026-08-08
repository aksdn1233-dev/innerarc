"use client";

import { useState } from "react";

export type AdminInquiry = Readonly<{
  id: string;
  order_id: string | null;
  category: string;
  contact: string;
  message: string;
  status: string;
  admin_note: string;
  created_at: string;
}>;

const CATEGORY_LABEL: Record<string, string> = {
  payment: "결제 실패",
  report: "리포트 열람",
  refund: "환불 요청",
  other: "기타",
};

const STATUS_LABEL: Record<string, string> = {
  open: "미처리",
  answered: "답변함",
  closed: "종료",
};

export function AdminInquiryList({ inquiries }: { inquiries: readonly AdminInquiry[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(inquiries.map((item) => [item.id, item.admin_note])),
  );
  const [done, setDone] = useState<Record<string, string>>({});

  async function update(id: string, status: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: notes[id] ?? "" }),
      });
      setDone((current) => ({
        ...current,
        [id]: response.ok ? `저장됨 · ${STATUS_LABEL[status] ?? status}` : "저장 실패",
      }));
    } catch {
      setDone((current) => ({ ...current, [id]: "저장 실패" }));
    } finally {
      setBusyId(null);
    }
  }

  if (inquiries.length === 0) {
    return <p className="admin-empty">들어온 문의가 없습니다.</p>;
  }

  return (
    <div className="admin-inquiry-list">
      {inquiries.map((inquiry) => (
        <article className="admin-inquiry" key={inquiry.id}>
          <header>
            <span className={`admin-badge is-${inquiry.status}`}>
              {STATUS_LABEL[inquiry.status] ?? inquiry.status}
            </span>
            <strong>{CATEGORY_LABEL[inquiry.category] ?? inquiry.category}</strong>
            <small>{new Date(inquiry.created_at).toLocaleString("ko-KR")}</small>
          </header>
          <p className="admin-inquiry-contact">
            연락처 <code>{inquiry.contact}</code>
            {inquiry.order_id && <> · 주문 <code>{inquiry.order_id}</code></>}
          </p>
          <p className="admin-inquiry-message">{inquiry.message}</p>
          <label htmlFor={`note-${inquiry.id}`}>처리 메모</label>
          <textarea
            id={`note-${inquiry.id}`}
            maxLength={2_000}
            onChange={(event) =>
              setNotes((current) => ({ ...current, [inquiry.id]: event.target.value }))}
            rows={2}
            value={notes[inquiry.id] ?? ""}
          />
          <div className="admin-inquiry-actions">
            <button
              className="secondary-button"
              disabled={busyId === inquiry.id}
              onClick={() => void update(inquiry.id, "answered")}
              type="button"
            >
              답변함으로 표시
            </button>
            <button
              className="secondary-button"
              disabled={busyId === inquiry.id}
              onClick={() => void update(inquiry.id, "closed")}
              type="button"
            >
              종료
            </button>
            <span aria-live="polite">{done[inquiry.id] ?? ""}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
