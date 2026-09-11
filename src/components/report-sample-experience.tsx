import Link from "next/link";
import type { PaidReport } from "@/core/paid-reading";
import type { Locale } from "@/i18n/config";
import { CharacterWebtoonPanel as WebtoonPanel, ReportEmphasis, WebtoonCue, WebtoonOrbs } from "@/components/webtoon";
import { WebtoonReveal } from "@/components/webtoon-reveal";
import { AcquisitionSurveyPanel } from "@/components/acquisition-survey-panel";
import { DetailEditorialReport } from "@/components/detail-editorial-report";

type SampleKind = "detail" | "premium" | "saju";

const sampleLinks: ReadonlyArray<{ kind: SampleKind; ko: string; en: string; ja: string }> = [
  { kind: "detail", ko: "상세 리딩", en: "Detailed reading", ja: "詳細リーディング" },
  { kind: "premium", ko: "프리미엄", en: "Premium", ja: "プレミアム" },
  { kind: "saju", ko: "사주 원국", en: "Four Pillars", ja: "四柱命式" },
];

export function ReportSampleExperience({
  locale,
  kind,
  report,
}: {
  locale: Locale;
  kind: SampleKind;
  report: PaidReport;
}) {
  const ko = locale === "ko";
  const basis = report.calculationBasis;
  const numberValue = (value: number) => value === 11 ? "11/2" : value === 22 ? "22/4" : value === 33 ? "33/6" : String(value);
  const orbItems = basis ? [
    { label: ko ? "생명수" : "Life path", value: numberValue(basis.lifePath) },
    { label: ko ? "생일수" : "Birthday", value: numberValue(basis.birthday) },
    { label: ko ? "태도수" : "Attitude", value: numberValue(basis.attitude) },
    { label: ko ? "연도수" : "Birth year", value: numberValue(basis.birthYear) },
    { label: ko ? "개인년" : "Personal year", value: numberValue(basis.personalYear), note: String(basis.serviceYear) },
  ] : [];
  const sampleNavigation = (<>
    <nav aria-label={ko ? "결과 예시 언어" : "Report sample language"} className="sample-report-language-tabs">
      <Link aria-current={locale === "ko" ? "page" : undefined} href={`/ko/samples/${kind}`} prefetch={false}>한국어</Link>
      <Link aria-current={locale === "en" ? "page" : undefined} href={`/en/samples/${kind}`} prefetch={false}>English</Link>
      <Link href={`/ja/samples/${kind}`} lang="ja" prefetch={false}>日本語</Link>
    </nav>
    <nav aria-label={ko ? "결과 예시 선택" : "Choose a report sample"} className="sample-report-tabs">
      {sampleLinks.map((item) => (
        <Link
          aria-current={item.kind === kind ? "page" : undefined}
          className={item.kind === kind ? "is-current" : undefined}
          href={`/${locale}/samples/${item.kind}`}
          key={item.kind}
          prefetch={false}
        >
          {ko ? item.ko : item.en}
        </Link>
      ))}
    </nav>
  </>
  );

  if (kind === "detail" || kind === "premium") {
    return (
      <DetailEditorialReport
        locale={locale}
        orderId={report.orderId}
        report={report}
        sample
        sampleNavigation={sampleNavigation}
        signedIn={false}
        footer={(
          <section className="webtoon-panel webtoon-paper webtoon-outro">
            <div className="webtoon-inner">
              <Link className="primary-button" href={`/${locale}`} prefetch={false}>{ko ? "홈으로" : "Home"}</Link>
              <AcquisitionSurveyPanel locale={locale} preview />
            </div>
          </section>
        )}
      />
    );
  }

  return (
    <main className={`shell paid-report-shell webtoon-shell sample-report-shell sample-${kind}`} id="main-content">
      <WebtoonReveal />
      <header className="sample-report-head">
        <Link className="brand" href={`/${locale}`} prefetch={false}><strong>태령당</strong></Link>
        <p className="eyebrow">{ko ? "941104 결과 리포트 예시" : "1994-11-04 report sample"}</p>
        <h1>{report.title}</h1>
        <p>{report.tierLabel}</p>
        <p className="sample-report-notice">
          {ko
            ? "실제 상품 계산기와 리포트 구성으로 만든 고정 예시입니다. 결제·주문·저장은 발생하지 않습니다."
            : "A fixed sample built with the production calculator and report structure. It creates no payment, order, or storage."}
        </p>
        {sampleNavigation}
      </header>

      <WebtoonPanel badge={ko ? "요약" : "Summary"} title={report.summary} tone="night">
        {report.characterLabel && <p className="webtoon-lead">{report.characterLabel}</p>}
        {basis && <WebtoonOrbs items={orbItems} label={ko ? "생년월일 패턴 계산 기준" : "Numerology calculation basis"} />}
        <WebtoonCue />
      </WebtoonPanel>

      {report.sections.map((section, index) => (
        <WebtoonPanel
          badge={ko ? `제 ${index + 1} 장` : `Chapter ${index + 1}`}
          key={`${section.title}-${index}`}
          title={section.title}
          tone={index % 2 === 0 ? "paper" : "night"}
        >
          {section.keySentence && (
            <p className="report-key-sentence"><strong>{section.keySentence}</strong></p>
          )}
          <div className="sample-report-body"><ReportEmphasis>{section.body}</ReportEmphasis></div>
        </WebtoonPanel>
      ))}

      <WebtoonPanel badge={ko ? "실천" : "Actions"} title={ko ? "결과를 현실에서 확인하는 방법" : "How to check this in real life"} tone="paper">
        <ul>{report.actions.map((action) => <li key={action}><ReportEmphasis>{action}</ReportEmphasis></li>)}</ul>
        {report.cautions.length > 0 && <ul>{report.cautions.map((caution) => <li key={caution}><ReportEmphasis>{caution}</ReportEmphasis></li>)}</ul>}
        <p className="disclaimer"><ReportEmphasis>{report.disclaimer}</ReportEmphasis></p>
        <Link className="primary-button" href={`/${locale}`} prefetch={false}>{ko ? "홈으로" : "Home"}</Link>
      </WebtoonPanel>
      <AcquisitionSurveyPanel locale={locale} preview />
    </main>
  );
}
