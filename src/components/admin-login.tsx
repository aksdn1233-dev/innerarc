"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { SupabasePublicConfig } from "@/lib/supabase/config";
import type { Locale } from "@/i18n/config";

// The owner console is the only account surface left, so it needs its own way in.
// Authentication proves mailbox ownership here. Authorization remains a server-only
// decision after the callback, so the browser never embeds or filters administrator identities.
export function AdminLogin({
  locale,
  supabaseConfig,
}: {
  locale: Locale;
  supabaseConfig: SupabasePublicConfig | null;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim().toLowerCase();
    setStatus("sending");
    const client = getBrowserSupabaseClient(supabaseConfig);
    if (!client) {
      setStatus("failed");
      return;
    }
    const next = encodeURIComponent(`/${locale}/admin`);
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        // Account creation is also used by the optional account-sync surface. It grants
        // no console access; the callback target is checked against the server allowlist.
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
    setStatus(error ? "failed" : "sent");
  }

  if (status === "sent") {
    return (
      <main className="shell" id="main-content">
        <p className="eyebrow">관리자</p>
        <h1>로그인 링크를 보냈습니다.</h1>
        <p>
          등록된 관리자 주소라면 메일함에 로그인 링크가 도착합니다. 링크를 누르면
          관리자 화면으로 바로 이동합니다. 메일이 안 보이면 스팸함도 확인해 주세요.
        </p>
        <p className="plans-notice">링크는 한 번만 쓸 수 있고 일정 시간이 지나면 만료됩니다.</p>
        <p className="payment-result-links">
          <Link className="link-button" href={`/${locale}`}>홈으로</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="shell" id="main-content">
      <p className="eyebrow">관리자</p>
      <h1>관리자 로그인</h1>
      <p>등록된 관리자 이메일로 로그인 링크를 보내드립니다. 비밀번호는 사용하지 않습니다.</p>

      <form className="order-lookup-form" onSubmit={(event) => void submit(event)}>
        <div className="field">
          <label htmlFor="admin-email">이메일</label>
          <input
            autoComplete="email"
            autoCapitalize="none"
            id="admin-email"
            inputMode="email"
            name="email"
            required
            spellCheck={false}
            type="email"
          />
        </div>
        <button className="primary-button" disabled={status === "sending"} type="submit">
          {status === "sending" ? "보내는 중…" : "로그인 링크 받기"}
        </button>
      </form>

      <div aria-live="polite">
        {status === "failed" && (
          <p className="error" role="alert">
            링크를 보내지 못했습니다. 이메일 주소를 확인하고 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>

      <p className="payment-result-links">
        <Link className="link-button" href={`/${locale}`}>홈으로</Link>
      </p>
    </main>
  );
}
