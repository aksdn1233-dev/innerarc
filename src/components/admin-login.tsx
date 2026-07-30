"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Locale } from "@/i18n/config";

// The owner console is the only account surface left, so it needs its own way in.
// The result never says whether an address is an administrator: any well-formed
// address gets the same reply, and only ADMIN_EMAILS can actually open the console.
export function AdminLogin({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus("failed");
      return;
    }
    setStatus("sending");
    const client = getBrowserSupabaseClient();
    if (!client) {
      setStatus("failed");
      return;
    }
    const next = encodeURIComponent(`/${locale}/admin`);
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        // No sign-up: a stray address cannot create an account from this form.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
    // Reported as sent either way, so this page cannot be used to discover which
    // addresses exist or which of them administer the site.
    setStatus(error && error.status === 429 ? "failed" : "sent");
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
            id="admin-email"
            name="email"
            required
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
