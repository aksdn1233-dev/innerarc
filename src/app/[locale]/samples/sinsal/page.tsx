import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildSajuChart } from "@/core/saju";
import { describeSinsal } from "@/core/saju/sinsal";
import { isLocale } from "@/i18n/config";
import { getSampleReport } from "@/server/reports/sample-report";

export const metadata: Metadata = { title: "신살 결과 미리보기", robots: { index: false, follow: false } };

export default async function SinsalSample({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ko = locale === "ko";
  const chart = buildSajuChart({ birthDate: "1994-11-04", sex: "male" });
  const examples = [
    { title: ko ? "무료 결과" : "Free result", text: describeSinsal(chart, locale), href: `/${locale}/saju` },
    { title: ko ? "상세 리포트" : "Detailed report", text: getSampleReport("detail", locale).sinsal?.body, href: `/${locale}/samples/detail` },
    { title: ko ? "고급 리포트" : "Premium report", text: getSampleReport("premium", locale).sinsal?.body, href: `/${locale}/samples/premium` },
  ];
  return <main className="shell" id="main-content">
    <header><Link className="brand" href={`/${locale}`}>결</Link><h1>{ko ? "신살 결과 미리보기" : "Preview traditional markers"}</h1><p>{ko ? "1994년 11월 4일, 출생 시간 미입력 예시예요. 실제 계산으로 만들었고 결제나 저장은 하지 않아요." : "A calculated example for November 4, 1994, without a birth time. No payment or storage occurs."}</p></header>
    {examples.map(example => <section className="webtoon-panel webtoon-paper" key={example.title}><div className="webtoon-inner"><h2>{example.title}</h2>{example.text?.split("\n\n").map(line => <p key={line}>{line}</p>)}<Link className="link-button" href={example.href}>{ko ? "전체 화면 보기" : "View full screen"}</Link></div></section>)}
    <p><Link href={`/${locale}`}>{ko ? "홈으로" : "Home"}</Link></p>
  </main>;
}
