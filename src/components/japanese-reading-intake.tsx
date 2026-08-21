"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type ProductCode = "plus_30d" | "pro_30d" | "premium_pdf";

export function JapaneseReadingIntake() {
  const [productCode, setProductCode] = useState<ProductCode>("pro_30d");
  const [readingFor, setReadingFor] = useState<"self" | "gift">("self");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!form.get("birthDate")) return setError("生年月日を選択してください。");
    if (form.get("privacyRequired") !== "on") return setError("個人情報の取扱いを確認してください。");
    if (readingFor === "gift" && form.get("giftConsent") !== "on") return setError("ご本人から情報入力と結果送付の同意を得たことを確認してください。");

    const payload = {
      version: 1,
      locale: "en",
      productCode,
      birthDate: String(form.get("birthDate")),
      birthTime: String(form.get("birthTime") ?? "").trim() || undefined,
      name: String(form.get("name") ?? "").trim(),
      focusId: String(form.get("interest") ?? "relationships"),
      concern: String(form.get("concern") ?? "").trim(),
      questions: [String(form.get("concern") ?? "").trim()].filter(Boolean),
      gender: String(form.get("gender") ?? "unstated"),
      createdAt: new Date().toISOString(),
    };
    window.sessionStorage.setItem("innerarc.checkoutDraft.v1", JSON.stringify(payload));
    window.location.assign(`/ja/plans?product=${productCode}`);
  }

  return (
    <main className="japanese-entry-shell" id="main-content">
      <header className="japanese-entry-topbar">
        <Link href="/ja"><strong>結 GYEOL</strong></Link>
        <nav aria-label="Language"><Link href="/ko/reading">한국어</Link><Link href="/en/reading">English</Link></nav>
      </header>
      <section className="japanese-reading-hero">
        <p className="eyebrow">PERSONAL READING</p>
        <h1>あなたのためのリーディングを準備します</h1>
        <p>生年月日と、今いちばん気になることだけを入力してください。</p>
      </section>
      <form className="japanese-reading-form" onSubmit={submit}>
        <fieldset><legend>1. リーディング商品</legend>
          {[["plus_30d", "四柱推命・命式 5,500ウォン"], ["pro_30d", "詳細リーディング 39,000ウォン"], ["premium_pdf", "プレミアム深層リーディング 79,000ウォン"]].map(([value, label]) => <label key={value}><input checked={productCode === value} onChange={() => setProductCode(value as ProductCode)} type="radio" /><span>{label}</span></label>)}
        </fieldset>
        <fieldset><legend>2. 誰のためのリーディングですか？</legend>
          <label><input checked={readingFor === "self"} onChange={() => setReadingFor("self")} type="radio" /><span>自分のため</span></label>
          <label><input checked={readingFor === "gift"} onChange={() => setReadingFor("gift")} type="radio" /><span>大切な人へのギフト</span></label>
          {readingFor === "gift" && <label className="japanese-consent"><input name="giftConsent" type="checkbox" /><span>ご本人から、生年月日などの情報入力と完成した結果の送付について同意を得ています。</span></label>}
        </fieldset>
        <div className="japanese-field-grid">
          <label>生年月日（必須）<input name="birthDate" type="date" required /></label>
          <label>出生時刻（任意）<input name="birthTime" type="time" /></label>
          <label>レポートに表示する名前（任意）<input maxLength={200} name="name" /></label>
          <label>性別<select name="gender"><option value="unstated">回答しない</option><option value="female">女性</option><option value="male">男性</option></select></label>
        </div>
        <label>今、最も気になる分野<select name="interest"><option value="relationships">人間関係</option><option value="work">仕事・キャリア</option><option value="money">お金</option><option value="growth">成長</option><option value="health">健康・生活</option></select></label>
        <label>今いちばん気になること（任意）<textarea maxLength={1000} name="concern" placeholder="1〜2文で入力してください。" /></label>
        <label className="japanese-consent"><input name="privacyRequired" type="checkbox" required /><span>入力情報が購入レポートの作成・保存・再表示に使われることを確認しました。</span></label>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit">入力を完了して決済へ</button>
        <p className="japanese-boundary">数秘術とタロットは自己理解のための象徴的なツールです。科学的な診断、未来の保証、医療・法律・投資の助言ではありません。</p>
      </form>
    </main>
  );
}
