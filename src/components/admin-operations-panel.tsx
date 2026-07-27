"use client";

import { useState } from "react";

export function AdminOperationsPanel({
  initialSalesEnabled,
  initialNotice,
}: {
  initialSalesEnabled: boolean;
  initialNotice: string;
}) {
  const [salesEnabled, setSalesEnabled] = useState(initialSalesEnabled);
  const [notice, setNotice] = useState(initialNotice);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salesEnabled, notice }),
    });
    setBusy(false);
    setMessage(response.ok ? "운영 설정을 저장했습니다." : "운영 설정을 저장하지 못했습니다.");
  }

  return (
    <section className="admin-settings-card">
      <h2>기본 운영 설정</h2>
      <label className="check">
        <input
          checked={salesEnabled}
          disabled={busy}
          onChange={(event) => setSalesEnabled(event.target.checked)}
          type="checkbox"
        />
        <span>신규 결제 접수 켜기</span>
      </label>
      <div className="field">
        <label htmlFor="admin-notice">운영 메모</label>
        <textarea
          id="admin-notice"
          value={notice}
          maxLength={500}
          onChange={(event) => setNotice(event.target.value)}
          placeholder="예: 현재 가상계좌 확인은 자동 처리됩니다."
        />
        <small>관리자 화면에만 표시되는 내부 메모입니다.</small>
      </div>
      <button className="primary-button" disabled={busy} onClick={() => void save()} type="button">
        저장
      </button>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
