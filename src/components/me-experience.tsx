"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  clearAllDeviceData,
  exportDeviceData,
  inspectDeviceData,
  isSupportedTimeZone,
  loadDevicePreferences,
  saveDevicePreferences,
  type DeviceDataCounts,
} from "@/core/privacy";
import type { Locale } from "@/i18n/config";
import type { MeCopy } from "@/i18n/me-copy";
import { AccountSyncPanel } from "@/components/account-sync-panel";
import {
  AccountReportsPanel,
  type AccountReportSummary,
  type NotificationPreferences,
} from "@/components/account-reports-panel";

type Props = {
  locale: Locale;
  copy: MeCopy;
  account: Readonly<{ email: string | null }> | null;
  accountSyncConfigured: boolean;
  reports: readonly AccountReportSummary[];
  notificationPreferences: NotificationPreferences;
  adminAccess: boolean;
};
type OptionalConsentKey =
  | "aiPersonalization"
  | "modelTraining"
  | "productAnalytics"
  | "marketing"
  | "rawJournalRetention";

const emptyCounts: DeviceDataCounts = {
  preferences: 0,
  tarotReadings: 0,
  realityChecks: 0,
  dailyFortune: 0,
  total: 0,
};

const emptyConsents: Record<OptionalConsentKey, boolean> = {
  aiPersonalization: false,
  modelTraining: false,
  productAnalytics: false,
  marketing: false,
  rawJournalRetention: false,
};

export function MeExperience({
  locale,
  copy,
  account,
  accountSyncConfigured,
  reports,
  notificationPreferences,
  adminAccess,
}: Props) {
  const timeZoneInput = useRef<HTMLInputElement>(null);
  const [privacyRequired, setPrivacyRequired] = useState(false);
  const [consents, setConsents] = useState(emptyConsents);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [counts, setCounts] = useState<DeviceDataCounts>(emptyCounts);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const otherLocale = locale === "ko" ? "en" : "ko";

  function setConsent(key: OptionalConsentKey, checked: boolean) {
    setConsents((current) => ({ ...current, [key]: checked }));
    setMessage("");
  }

  function inspectSavedData() {
    const preferences = loadDevicePreferences(window.localStorage);
    if (preferences) {
      if (timeZoneInput.current) timeZoneInput.current.value = preferences.timeZone;
      setPrivacyRequired(true);
      setAcceptedAt(preferences.consents.acceptedAt);
      setConsents({
        aiPersonalization: preferences.consents.aiPersonalization,
        modelTraining: preferences.consents.modelTraining,
        productAnalytics: preferences.consents.productAnalytics,
        marketing: preferences.consents.marketing,
        rawJournalRetention: preferences.consents.rawJournalRetention,
      });
    }
    setCounts(inspectDeviceData(window.localStorage));
    setError("");
    setMessage("");
  }

  function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submittedTimeZone = String(form.get("timeZone") ?? "").trim();
    setMessage("");
    setError("");
    if (!privacyRequired) {
      setError(copy.privacyError);
      return;
    }
    if (!isSupportedTimeZone(submittedTimeZone)) {
      setError(copy.timeZoneError);
      return;
    }
    const now = new Date().toISOString();
    saveDevicePreferences(window.localStorage, {
      version: 1,
      locale,
      timeZone: submittedTimeZone,
      consents: {
        privacyRequired: true,
        ...consents,
        acceptedAt: acceptedAt ?? now,
        policyVersion: "privacy-1.0.0",
      },
      updatedAt: now,
    });
    setAcceptedAt((current) => current ?? now);
    setCounts(inspectDeviceData(window.localStorage));
    setMessage(copy.saved);
  }

  function downloadAll() {
    const content = exportDeviceData(window.localStorage, new Date().toISOString());
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `innerarc-device-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function deleteAll() {
    if (!window.confirm(copy.deleteConfirm)) return;
    clearAllDeviceData(window.localStorage);
    setCounts(emptyCounts);
    setPrivacyRequired(false);
    setConsents(emptyConsents);
    setAcceptedAt(null);
    setMessage(copy.deleted);
    setError("");
  }

  const consentOptions: readonly [OptionalConsentKey, string][] = [
    ["aiPersonalization", copy.aiPersonalization],
    ["modelTraining", copy.modelTraining],
    ["productAnalytics", copy.productAnalytics],
    ["marketing", copy.marketing],
    ["rawJournalRetention", copy.rawJournalRetention],
  ];

  return (
    <>
      <main className="shell me-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong>
            <small>{copy.brandTagline}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/me`}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="me-hero" aria-labelledby="me-title">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 id="me-title">{copy.title}</h1>
          <p>{copy.intro}</p>
        </section>

        <section className="me-grid">
          <article className="status-card">
            <p className="eyebrow">{account ? "Account" : "Guest"}</p>
            <h2>{account ? (locale === "ko" ? "로그인 계정" : "Signed-in account") : copy.guestTitle}</h2>
            <p>
              {account
                ? (locale === "ko"
                    ? "명시적으로 동기화한 기록만 소유자 전용 서버 저장소에 보관됩니다."
                    : "Only records you explicitly synchronize are stored in owner-scoped server storage.")
                : copy.guestBody}
            </p>
            {!account && <p className="privacy-note">{copy.providerNote}</p>}
            {adminAccess && (
              <Link className="secondary-button" href={`/${locale}/admin`}>
                {locale === "ko" ? "관리자 페이지 열기" : "Open admin"}
              </Link>
            )}
          </article>

          <AccountSyncPanel
            locale={locale}
            account={account}
            configured={accountSyncConfigured}
          />

          {account && (
            <AccountReportsPanel
              locale={locale}
              reports={reports}
              initialPreferences={notificationPreferences}
            />
          )}

          <form className="form-card me-preferences" onSubmit={savePreferences} noValidate>
            <h2>{copy.preferencesTitle}</h2>
            <p>{copy.preferencesBody}</p>

            <div className="field">
              <span className="field-label">{copy.language}</span>
              <div className="language-choice" aria-label={copy.language}>
                <Link className={locale === "ko" ? "active" : ""} href="/ko/me" hrefLang="ko">한국어</Link>
                <Link className={locale === "en" ? "active" : ""} href="/en/me" hrefLang="en">English</Link>
              </div>
            </div>

            <div className="field">
              <label htmlFor="me-time-zone">{copy.timeZone}</label>
              <input
                id="me-time-zone"
                name="timeZone"
                ref={timeZoneInput}
                defaultValue={locale === "ko" ? "Asia/Seoul" : "UTC"}
                onInput={() => setMessage("")}
                maxLength={100}
                autoComplete="off"
                required
              />
              <small>{copy.timeZoneHelp}</small>
            </div>

            <label className="check">
              <input
                type="checkbox"
                checked={privacyRequired}
                onChange={(event) => { setPrivacyRequired(event.target.checked); setMessage(""); }}
                required
              />
              <span>{copy.privacyRequired}</span>
            </label>
            <div className="legal-note">
              <Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보 처리 안내 읽기" : "Read the privacy information"}</Link>
              <Link href={`/${locale}/terms`}>{locale === "ko" ? "출시 전 이용조건" : "Pre-release terms"}</Link>
              <Link href={`/${locale}/plans`}>{locale === "ko" ? "30일 이용권 준비 상태" : "30-day access readiness"}</Link>
            </div>

            {consentOptions.map(([key, label]) => (
              <label className="check" key={key}>
                <input
                  type="checkbox"
                  checked={consents[key]}
                  onChange={(event) => setConsent(key, event.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}

            <p className="privacy-note">{copy.consentNote}</p>
            <div className="form-actions">
              <button className="primary-button" type="submit">{copy.save}</button>
              {error && <span className="error" role="alert">{error}</span>}
              {message && <span className="success" role="status">{message}</span>}
            </div>
          </form>

          <article className="status-card device-rights">
            <h2>{copy.deviceTitle}</h2>
            <p>{copy.deviceBody}</p>
            <div className="count-grid" aria-live="polite">
              <div><strong>{counts.preferences}</strong><span>{copy.preferencesCount}</span></div>
              <div><strong>{counts.tarotReadings}</strong><span>{copy.tarotCount}</span></div>
              <div><strong>{counts.realityChecks}</strong><span>{copy.realityCount}</span></div>
              <div><strong>{counts.dailyFortune}</strong><span>{copy.dailyFortuneCount}</span></div>
            </div>
            <div className="history-actions">
              <button type="button" onClick={inspectSavedData}>{copy.inspect}</button>
              <button type="button" onClick={downloadAll}>{copy.exportAll}</button>
              <button className="danger-button" type="button" onClick={deleteAll}>{copy.deleteAll}</button>
            </div>
            <p className="history-warning">{copy.exportNote}</p>
          </article>
        </section>
      </main>
    </>
  );
}
