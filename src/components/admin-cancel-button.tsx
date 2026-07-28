"use client";

import { useState } from "react";

// Refunds are irreversible from the buyer's side, so the operator has to type the
// confirmation phrase and a reason before the request is sent. Whatever PayApp says
// on refusal is shown verbatim rather than flattened into "failed".
export function AdminCancelButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function cancel() {
    setBusy(true);
    setResult("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation, reason }),
      });
      const body = await response.json().catch(() => ({})) as {
        ok?: boolean;
        providerMessage?: string;
        error?: string;
      };
      if (response.ok && body.ok) {
        setResult("취소 요청 완료. 페이앱 통보가 도착하면 상태와 리포트 접근이 함께 정리됩니다.");
        setOpen(false);
      } else {
        setResult(body.providerMessage ?? `실패: ${body.error ?? response.status}`);
      }
    } catch {
      setResult("요청을 보내지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <>
        <button className="secondary-button" onClick={() => setOpen(true)} type="button">
          결제취소
        </button>
        {result && <small className="admin-cancel-result">{result}</small>}
      </>
    );
  }

  return (
    <div className="admin-cancel-form">
      <label htmlFor={`reason-${orderId}`}>취소 사유</label>
      <input
        id={`reason-${orderId}`}
        onChange={(event) => setReason(event.target.value)}
        placeholder="예: 고객 환불 요청"
        type="text"
        value={reason}
      />
      <label htmlFor={`confirm-${orderId}`}>확인을 위해 &quot;결제취소&quot;를 입력하세요</label>
      <input
        id={`confirm-${orderId}`}
        onChange={(event) => setConfirmation(event.target.value)}
        type="text"
        value={confirmation}
      />
      <div className="admin-inquiry-actions">
        <button
          className="secondary-button"
          disabled={busy || confirmation !== "결제취소" || reason.trim().length < 2}
          onClick={() => void cancel()}
          type="button"
        >
          {busy ? "요청 중…" : "취소 실행"}
        </button>
        <button className="secondary-button" onClick={() => setOpen(false)} type="button">
          그만두기
        </button>
      </div>
      {result && <small className="admin-cancel-result">{result}</small>}
    </div>
  );
}
