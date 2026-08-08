"use client";

import Link from "next/link";
import { useState } from "react";
import type { PaidReport } from "@/core/paid-reading";
import type { Locale } from "@/i18n/config";

export type AccountReportSummary = Readonly<{
  orderId: string;
  productCode: string;
  status: string;
  createdAt: string;
  report: PaidReport | null;
}>;

export type NotificationPreferences = Readonly<{
  inAppEnabled: boolean;
  cautionReminders: boolean;
  emailEnabled: boolean;
}>;

export function AccountReportsPanel({
  locale,
  reports,
  initialPreferences,
}: {
  locale: Locale;
  reports: readonly AccountReportSummary[];
  initialPreferences: NotificationPreferences;
}) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const latestCaution = reports.find((item) => item.report)?.report?.cautions[0];

  async function savePreferences(next: NotificationPreferences) {
    setPreferences(next);
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/account/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setBusy(false);
    setMessage(response.ok
      ? locale === "ko" ? "알림 설정을 저장했습니다." : "Notification settings saved."
      : locale === "ko" ? "알림 설정을 저장하지 못했습니다." : "Could not save notification settings.");
  }

  return (
    <>
      <article className="status-card account-reports">
        <p className="eyebrow">{locale === "ko" ? "구매 리포트" : "Purchased reports"}</p>
        <h2>{locale === "ko" ? "내 리포트 다시 보기" : "Open my reports"}</h2>
        {!reports.length && <p>{locale === "ko" ? "아직 구매한 리포트가 없습니다." : "No purchased reports yet."}</p>}
        <div className="account-report-list">
          {reports.map((item) => (
            <div key={item.orderId}>
              <div>
                <strong>{item.report?.title ?? item.productCode}</strong>
                <small>{new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US").format(new Date(item.createdAt))}</small>
              </div>
              {item.status === "ready"
                ? <Link href={`/${locale}/reports/${item.orderId}`}>{locale === "ko" ? "열기" : "Open"}</Link>
                : <span>{locale === "ko" ? "준비 중" : "Preparing"}</span>}
            </div>
          ))}
        </div>
      </article>

      <article className="status-card notification-settings">
        <p className="eyebrow">{locale === "ko" ? "알림 설정" : "Notifications"}</p>
        <h2>{locale === "ko" ? "원할 때만 알려드려요" : "Only when you want it"}</h2>
        {preferences.inAppEnabled && preferences.cautionReminders && latestCaution && (
          <div className="caution-reminder">
            <strong>{locale === "ko" ? "이럴 때는 조심하셔야 하는 것, 알고 계시죠?" : "Remember what to watch for?"}</strong>
            <p>{latestCaution}</p>
          </div>
        )}
        <label className="check">
          <input
            checked={preferences.inAppEnabled}
            disabled={busy}
            onChange={(event) => void savePreferences({ ...preferences, inAppEnabled: event.target.checked })}
            type="checkbox"
          />
          <span>{locale === "ko" ? "마이페이지 알림 켜기" : "Show My Page notifications"}</span>
        </label>
        <label className="check">
          <input
            checked={preferences.cautionReminders}
            disabled={busy}
            onChange={(event) => void savePreferences({ ...preferences, cautionReminders: event.target.checked })}
            type="checkbox"
          />
          <span>{locale === "ko" ? "리포트 주의사항 알림" : "Report caution reminders"}</span>
        </label>
        <label className="check">
          <input
            checked={preferences.emailEnabled}
            disabled={busy}
            onChange={(event) => void savePreferences({ ...preferences, emailEnabled: event.target.checked })}
            type="checkbox"
          />
          <span>{locale === "ko" ? "이메일 알림 신청" : "Email notifications"}</span>
        </label>
        <small>
          {locale === "ko"
            ? "이메일 발송은 메일 발송 서비스가 연결된 뒤 시작되며, 설정은 미리 저장됩니다."
            : "Email delivery starts after a mail provider is connected; your preference is saved now."}
        </small>
        {message && <p role="status">{message}</p>}
      </article>
    </>
  );
}
