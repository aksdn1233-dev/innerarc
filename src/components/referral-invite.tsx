"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";

export function ReferralInvite({ locale, eventUrl }: { locale: Locale; eventUrl: string }) {
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const ko = locale === "ko";

  async function createInvite() {
    setStatus("loading");
    try {
      const response = await fetch("/api/referrals/coupon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const body = await response.json() as { couponCode?: string };
      if (!response.ok || !body.couponCode) throw new Error("COUPON_FAILED");
      setCoupon(body.couponCode);
      setStatus("ready");
      const shareUrl = `${eventUrl}?ref=friend`;
      if (navigator.share) await navigator.share({ title: ko ? "태령당 친구 초대" : "태령당 friend invitation", text: ko ? "태령당에서 나와 관계의 패턴을 함께 살펴보자." : "Explore personal and relationship patterns together on 태령당.", url: shareUrl });
      else await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") { setStatus(coupon ? "ready" : "idle"); return; }
      setStatus("error");
    }
  }

  async function copyCoupon() {
    try { await navigator.clipboard.writeText(coupon); } catch { /* selectable code remains visible */ }
  }

  return (
    <div className="referral-invite">
      <label htmlFor="referrer-phone">{ko ? "내 결제 휴대폰 번호" : "Your checkout mobile number"}</label>
      <div><input id="referrer-phone" inputMode="tel" onChange={(event) => setPhone(event.target.value)} placeholder="010-1234-5678" type="tel" value={phone} /><button className="primary-button" disabled={status === "loading"} onClick={() => void createInvite()} type="button">{status === "loading" ? (ko ? "만드는 중…" : "Creating…") : (ko ? "초대하고 쿠폰 받기" : "Invite and get coupon")}</button></div>
      <small>{ko ? "번호는 저장하지 않고 쿠폰을 해당 결제 번호에 연결하는 데만 사용합니다. 39,000원 이상 리딩에 1회 사용할 수 있습니다." : "The number is not stored. It only binds the coupon to your checkout phone. Use it once on a reading of ₩39,000 or more."}</small>
      {coupon && <p className="referral-coupon"><span>{ko ? "발급된 5,000원 쿠폰" : "Your ₩5,000 coupon"}</span><code>{coupon}</code><button onClick={() => void copyCoupon()} type="button">{ko ? "복사" : "Copy"}</button></p>}
      {status === "error" && <p className="error" role="alert">{ko ? "휴대폰 번호를 확인하거나 잠시 후 다시 시도해 주세요." : "Check the mobile number or try again shortly."}</p>}
    </div>
  );
}
