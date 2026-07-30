"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminDepositButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function markPaid() {
    const confirmed = window.confirm(
      "실제 계좌 입금 내역을 확인했습니까? 확인하면 리포트가 즉시 열립니다.",
    );
    if (!confirmed) return;

    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/mark-paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: "입금확인" }),
    });
    setBusy(false);
    if (!response.ok) {
      setError("처리하지 못했습니다. 주문 상태와 입금 내역을 다시 확인해 주세요.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-deposit-action">
      <button disabled={busy} onClick={() => void markPaid()} type="button">
        {busy ? "처리 중…" : "입금 확인"}
      </button>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
