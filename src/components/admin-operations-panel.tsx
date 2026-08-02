"use client";

import { useState } from "react";
import type { AdminPageContent } from "@/server/admin-content";

export function AdminOperationsPanel({
  initialSalesEnabled,
  initialNotice,
  initialPageContent,
}: {
  initialSalesEnabled: boolean;
  initialNotice: string;
  initialPageContent: AdminPageContent;
}) {
  const [salesEnabled, setSalesEnabled] = useState(initialSalesEnabled);
  const [notice, setNotice] = useState(initialNotice);
  const [pageContent, setPageContent] = useState(initialPageContent);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salesEnabled, notice, pageContent }),
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
      <div className="admin-content-editor">
        <div>
          <h3>첫 화면 문구</h3>
          <p>결제 가격과 법적 안내는 수정되지 않습니다. 첫 화면의 핵심 문구만 안전하게 바꿀 수 있습니다.</p>
        </div>
        {(["ko", "en"] as const).map((language) => (
          <fieldset className="admin-content-language" key={language}>
            <legend>{language === "ko" ? "한국어" : "English"}</legend>
            <label>
              <span>상단 한 줄</span>
              <input
                maxLength={80}
                value={pageContent[language].heroKicker}
                onChange={(event) => setPageContent((current) => ({
                  ...current,
                  [language]: { ...current[language], heroKicker: event.target.value },
                }))}
              />
            </label>
            <label>
              <span>메인 제목</span>
              <input
                maxLength={80}
                value={pageContent[language].heroTitle}
                onChange={(event) => setPageContent((current) => ({
                  ...current,
                  [language]: { ...current[language], heroTitle: event.target.value },
                }))}
              />
            </label>
            <label>
              <span>설명</span>
              <textarea
                maxLength={240}
                value={pageContent[language].heroBody}
                onChange={(event) => setPageContent((current) => ({
                  ...current,
                  [language]: { ...current[language], heroBody: event.target.value },
                }))}
              />
            </label>
            <label>
              <span>버튼 문구</span>
              <input
                maxLength={40}
                value={pageContent[language].primaryCta}
                onChange={(event) => setPageContent((current) => ({
                  ...current,
                  [language]: { ...current[language], primaryCta: event.target.value },
                }))}
              />
            </label>
          </fieldset>
        ))}
        <a className="link-button" href="/ko" rel="noreferrer" target="_blank">홈페이지 미리 보기</a>
      </div>
      <button className="primary-button" disabled={busy} onClick={() => void save()} type="button">
        저장
      </button>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
