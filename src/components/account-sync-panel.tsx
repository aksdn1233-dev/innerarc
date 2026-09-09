"use client";

import { useState, type FormEvent } from "react";
import {
  loadDevicePreferences,
  saveDevicePreferences,
} from "@/core/privacy";
import {
  loadRealityChecks,
  saveRealityChecks,
} from "@/core/reality-check";
import {
  loadTarotHistory,
  saveTarotHistory,
} from "@/core/tarot";
import type { Locale } from "@/i18n/config";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type AccountSummary = Readonly<{ email: string | null }> | null;
type Props = Readonly<{
  locale: Locale;
  account: AccountSummary;
  configured: boolean;
}>;

type SyncPayload = {
  preferences: ReturnType<typeof loadDevicePreferences>;
  tarotReadings: ReturnType<typeof loadTarotHistory>;
  realityChecks: ReturnType<typeof loadRealityChecks>;
};

const copy = {
  ko: {
    title: "계정과 안전한 동기화",
    connected: "Supabase 계정이 연결되어 있습니다.",
    signedOut: "이메일 인증 링크로 로그인하면 기기 기록을 계정에 동기화할 수 있습니다.",
    disabled: "서버 동기화가 아직 구성되지 않았습니다.",
    email: "이메일",
    sendLink: "로그인 링크 보내기",
    sent: "인증 링크를 보냈습니다. 같은 브라우저에서 링크를 열어주세요.",
    signOut: "로그아웃",
    upload: "이 기기 기록을 서버에 동기화",
    download: "서버 기록을 이 기기로 가져오기",
    export: "서버 기록 JSON 내보내기",
    delete: "서버에 저장된 내 기록 삭제",
    deleteConfirm: "서버의 프로필, 동의 기록, 이전 질문 기록, Reality Check, 3D 공간과 사진을 삭제할까요? 로그인 계정 자체는 유지됩니다.",
    synced: "기기 기록이 서버와 동기화되었습니다.",
    restored: "서버 기록을 검증한 뒤 이 기기에 저장했습니다.",
    deleted: "서버에 저장된 기록을 삭제했습니다. 로그인 계정은 유지됩니다.",
    imageDeletionPending: "공간 사진은 즉시 접근이 차단되며, 저장소 정리와 삭제 확인은 순차적으로 진행됩니다.",
    failed: "요청을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.",
    privacy: "기록은 로그인한 소유자만 접근할 수 있으며, 원시 질문이나 결과를 분석·마케팅 서비스로 보내지 않습니다.",
  },
  en: {
    title: "Account and secure sync",
    connected: "Your Supabase account is connected.",
    signedOut: "Sign in with an email link to sync device records to your account.",
    disabled: "Server sync is not configured yet.",
    email: "Email",
    sendLink: "Send sign-in link",
    sent: "A sign-in link was sent. Open it in this browser.",
    signOut: "Sign out",
    upload: "Sync this device to the server",
    download: "Restore server records to this device",
    export: "Export server records as JSON",
    delete: "Delete my server records",
    deleteConfirm: "Delete your server profile, consent receipts, tarot history, Reality Checks, and 3D rooms and photos? Your login identity will remain.",
    synced: "Device records were synchronized with the server.",
    restored: "Server records were validated and saved on this device.",
    deleted: "Server records were deleted. Your login identity remains.",
    imageDeletionPending: "Space photos are inaccessible immediately. Storage removal and deletion verification continue in the background.",
    failed: "The request could not be completed. Try again shortly.",
    privacy: "Only the signed-in owner can access these records. Raw questions and outcomes are not sent to analytics or marketing services.",
  },
} as const;

export function AccountSyncPanel({ locale, account, configured }: Props) {
  const t = copy[locale];
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getBrowserSupabaseClient();
    if (!client) return;
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    document.cookie = `innerarc-auth-locale=${locale}; Path=/; Max-Age=900; SameSite=Lax`;
    setBusy(true);
    setMessage("");
    setError("");
    const { error: authError } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (authError) setError(t.failed);
    else setMessage(t.sent);
  }

  async function signOut() {
    const client = getBrowserSupabaseClient();
    if (!client) return;
    setBusy(true);
    await client.auth.signOut();
    window.location.assign(`/${locale}/me`);
  }

  async function uploadDeviceRecords() {
    setBusy(true);
    setMessage("");
    setError("");
    const payload: SyncPayload = {
      preferences: loadDevicePreferences(window.localStorage),
      tarotReadings: loadTarotHistory(window.localStorage),
      realityChecks: loadRealityChecks(window.localStorage),
    };
    const response = await fetch("/api/account/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!response.ok) setError(t.failed);
    else setMessage(t.synced);
  }

  async function restoreServerRecords() {
    setBusy(true);
    setMessage("");
    setError("");
    const response = await fetch("/api/account/sync", {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      setBusy(false);
      setError(t.failed);
      return;
    }
    const payload = await response.json() as SyncPayload;
    if (payload.preferences) saveDevicePreferences(window.localStorage, payload.preferences);
    saveTarotHistory(window.localStorage, payload.tarotReadings);
    saveRealityChecks(window.localStorage, payload.realityChecks);
    setBusy(false);
    setMessage(t.restored);
  }

  async function deleteServerRecords() {
    if (!window.confirm(t.deleteConfirm)) return;
    setBusy(true);
    setMessage("");
    setError("");
    const response = await fetch("/api/account/data?scope=all_data", {
      method: "DELETE",
      headers: { "x-client-request-id": `delete:${crypto.randomUUID()}` },
    });
    setBusy(false);
    if (!response.ok) setError(t.failed);
    else { const result = await response.json(); setMessage(result.spaceImageDeletionPending ? `${t.deleted} ${t.imageDeletionPending}` : t.deleted); }
  }

  if (!configured) {
    return (
      <article className="status-card account-sync">
        <h2>{t.title}</h2>
        <p>{t.disabled}</p>
      </article>
    );
  }

  return (
    <article className="status-card account-sync">
      <h2>{t.title}</h2>
      <p>{account ? t.connected : t.signedOut}</p>
      {account ? (
        <>
          {account.email && <p><strong>{account.email}</strong></p>}
          <div className="history-actions">
            <button type="button" disabled={busy} onClick={uploadDeviceRecords}>{t.upload}</button>
            <button type="button" disabled={busy} onClick={restoreServerRecords}>{t.download}</button>
            <a className="text-button" href="/api/account/export" download>{t.export}</a>
            <button className="danger-button" type="button" disabled={busy} onClick={deleteServerRecords}>{t.delete}</button>
            <button type="button" disabled={busy} onClick={signOut}>{t.signOut}</button>
          </div>
        </>
      ) : (
        <form onSubmit={sendMagicLink}>
          <div className="field">
            <label htmlFor="account-email">{t.email}</label>
            <input id="account-email" name="email" type="email" autoComplete="email" required maxLength={320} />
          </div>
          <button className="primary-button" type="submit" disabled={busy}>{t.sendLink}</button>
        </form>
      )}
      <p className="privacy-note">{t.privacy}</p>
      {message && <p role="status" className="success">{message}</p>}
      {error && <p role="alert" className="error">{error}</p>}
    </article>
  );
}
