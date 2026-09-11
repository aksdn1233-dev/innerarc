import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = { title: "태령당 | Personal Pattern Intelligence", description: "生年月日をもとに繰り返すパターンと現実的な選択基準を整理します。" };

export default function JapaneseHomePage() {
  return <main className="japanese-home" id="main-content">
    <header><Link href="/ja"><strong>태령당</strong><small>Personal Pattern Intelligence</small></Link><nav aria-label="Language"><Link href="/ko">한국어</Link><Link href="/en">English</Link></nav></header>
    <section><div><p className="eyebrow">PERSONAL PATTERN READING</p><h1>繰り返す選択には、<br />理由があります。</h1><p>生年月日と今気になっていることから、自分・関係・仕事・お金に現れるパターンを整理します。</p><div className="japanese-home-actions"><Link href="/ja/reading">リーディングを始める</Link><Link href="/ja/samples/detail">結果レポートを見る</Link><Link href="/ja/plans">商品を見る</Link></div><small>一回払い・自動更新なし・ギフト共有対応</small></div><Image alt="リーディングガイドの泰玲" height={1280} priority src="/images/numerology-guides/gyeol-taeryeong.jpg" width={720} /></section>
  </main>;
}
