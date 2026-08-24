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
  dailyFlowEnabled: boolean;
  dailyConsentAccepted: boolean;
  dailyBirthMonth: number | null;
  dailyBirthDay: number | null;
  paidAutoEnable: boolean;
  timeZone: string;
}>;

export type DailyNotification = Readonly<{
  id: string;
  deliveryDate: string;
  title: string;
  summary: string;
  action: string;
  caution: string;
  question: string;
  readAt: string | null;
}>;

export function AccountReportsPanel({
  locale,
  reports,
  initialPreferences,
  dailyNotifications,
}: {
  locale: Locale;
  reports: readonly AccountReportSummary[];
  initialPreferences: NotificationPreferences;
  dailyNotifications: readonly DailyNotification[];
}) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [birthMonth, setBirthMonth] = useState(initialPreferences.dailyBirthMonth?.toString() ?? "");
  const [birthDay, setBirthDay] = useState(initialPreferences.dailyBirthDay?.toString() ?? "");
  const latestCaution = reports.find((item) => item.report)?.report?.cautions[0];

  async function savePreferences(next: NotificationPreferences) {
    setPreferences(next);
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/account/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...next,
        dailyBirthMonth: birthMonth ? Number(birthMonth) : null,
        dailyBirthDay: birthDay ? Number(birthDay) : null,
        locale,
        timeZone: "Asia/Seoul",
      }),
    });
    setBusy(false);
    setMessage(response.ok
      ? locale === "ko" ? "알림 설정을 저장했습니다." : "Notification settings saved."
      : locale === "ko" ? "알림 설정을 저장하지 못했습니다." : "Could not save notification settings.");
  }

  function dailySettings(next: Partial<NotificationPreferences> = {}): NotificationPreferences {
    return {
      ...preferences,
      dailyBirthMonth: birthMonth ? Number(birthMonth) : null,
      dailyBirthDay: birthDay ? Number(birthDay) : null,
      ...next,
    };
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
        <div className="morning-notification-card">
          <div>
            <p className="eyebrow">09:00 · KST</p>
            <h3>{locale === "ko" ? "매일 아침 오늘의 흐름" : "Your Daily Flow every morning"}</h3>
            <p>
              {locale === "ko"
                ? "동의한 생일의 월·일로 계산한 상징적 성찰 문장을 오전 9시에 마이페이지 알림함에 넣습니다."
                : "At 9 AM KST, a symbolic reflection calculated from your birth month and day is added to your My Page inbox."}
            </p>
          </div>
          <span aria-hidden="true">☼</span>
        </div>
        <div className="notification-birthday-row">
          <label>
            <span>{locale === "ko" ? "태어난 달" : "Birth month"}</span>
            <select disabled={busy} value={birthMonth} onChange={(event) => setBirthMonth(event.target.value)}>
              <option value="">—</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span>{locale === "ko" ? "태어난 날" : "Birth day"}</span>
            <select disabled={busy} value={birthDay} onChange={(event) => setBirthDay(event.target.value)}>
              <option value="">—</option>
              {Array.from({ length: 31 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <label className="check notification-consent-check">
          <input
            checked={preferences.dailyConsentAccepted}
            disabled={busy}
            onChange={(event) => {
              const accepted = event.target.checked;
              if (accepted && (!birthMonth || !birthDay)) {
                setMessage(locale === "ko"
                  ? "태어난 달과 일을 먼저 선택해 주세요."
                  : "Choose your birth month and day first.");
                return;
              }
              void savePreferences(dailySettings({
                dailyConsentAccepted: accepted,
                dailyFlowEnabled: accepted,
                inAppEnabled: accepted ? true : preferences.inAppEnabled,
                paidAutoEnable: accepted,
              }));
            }}
            type="checkbox"
          />
          <span>
            {locale === "ko"
              ? "생일 월·일을 매일 알림 계산에 활용하는 데 동의합니다."
              : "I consent to using my birth month and day for daily notification calculations."}
          </span>
        </label>
        <label className="check">
          <input
            checked={preferences.dailyFlowEnabled}
            disabled={busy || !preferences.dailyConsentAccepted}
            onChange={(event) => void savePreferences(dailySettings({
              dailyFlowEnabled: event.target.checked,
              inAppEnabled: event.target.checked ? true : preferences.inAppEnabled,
            }))}
            type="checkbox"
          />
          <span>{locale === "ko" ? "오전 9시 오늘의 흐름 알림" : "9 AM Daily Flow notification"}</span>
        </label>
        <label className="check">
          <input
            checked={preferences.paidAutoEnable}
            disabled={busy || !preferences.dailyConsentAccepted}
            onChange={(event) => void savePreferences(dailySettings({ paidAutoEnable: event.target.checked }))}
            type="checkbox"
          />
          <span>
            {locale === "ko"
              ? "결제 완료 시 오전 9시 알림을 자동으로 다시 켜기"
              : "Automatically re-enable morning notifications after a completed purchase"}
          </span>
        </label>
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
            ? "모든 알림은 끄는 즉시 중단됩니다. 동의를 철회하면 저장된 생일 월·일도 함께 삭제됩니다. 이메일은 발송 서비스 연결 후 별도로 시작됩니다."
            : "Turning notifications off stops them immediately. Withdrawing consent also deletes the stored month and day. Email begins separately after a delivery provider is connected."}
        </small>
        {message && <p role="status">{message}</p>}
      </article>

      <article className="status-card daily-notification-inbox">
        <p className="eyebrow">MORNING INBOX</p>
        <h2>{locale === "ko" ? "아침 알림함" : "Morning inbox"}</h2>
        {!dailyNotifications.length ? (
          <p>{locale === "ko" ? "아직 도착한 오늘의 흐름이 없습니다." : "No Daily Flow notification has arrived yet."}</p>
        ) : (
          <div className="daily-notification-list">
            {dailyNotifications.map((item) => (
              <details key={item.id} open={item === dailyNotifications[0]}>
                <summary><time>{item.deliveryDate}</time><strong>{item.title}</strong></summary>
                <p>{item.summary}</p>
                <dl>
                  <div><dt>{locale === "ko" ? "오늘의 작은 행동" : "Small action"}</dt><dd>{item.action}</dd></div>
                  <div><dt>{locale === "ko" ? "주의할 점" : "What to watch"}</dt><dd>{item.caution}</dd></div>
                  <div><dt>{locale === "ko" ? "오늘의 질문" : "Today's question"}</dt><dd>{item.question}</dd></div>
                </dl>
              </details>
            ))}
          </div>
        )}
        <p className="privacy-note">
          {locale === "ko"
            ? "오늘의 흐름은 상징적 자기 성찰 안내이며 미래를 예측하거나 결과를 보장하지 않습니다."
            : "Daily Flow is symbolic self-reflection. It does not predict or guarantee outcomes."}
        </p>
      </article>
    </>
  );
}
