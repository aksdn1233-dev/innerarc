import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ORDER_PASS_COOKIE, readOrderPass, readOrderTicket } from "@/server/order-pass";
import { MeteorTrails, NightHorizon } from "@/components/brand-visuals";
import { PaymentStatusWaiting } from "@/components/payment-status-waiting";
import { ReportActions } from "@/components/report-actions";
import { ReportViewBeacon } from "@/components/report-view-beacon";
import { ReviewRequestPanel } from "@/components/review-request-panel";
import { AcquisitionSurveyPanel } from "@/components/acquisition-survey-panel";
import { ReportRealityCheck } from "@/components/pattern-intelligence/report-reality-check";
import { EvidenceEventCapture } from "@/components/pattern-intelligence/evidence-event-capture";
import { DetailEditorialReport } from "@/components/detail-editorial-report";
import { CharacterWebtoonPanel as WebtoonPanel, ReportEmphasis, WebtoonCta, WebtoonCue, WebtoonOrbs } from "@/components/webtoon";
import { WebtoonReveal } from "@/components/webtoon-reveal";
import { toOwnReviewState } from "@/core/reviews";
import { brandNameForLocale } from "@/core/brand";
import { isLocale } from "@/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { getAuthorizedStoredReport } from "@/server/reports/access";
import { findReviewByOrderId } from "@/server/reviews";
import { findAcquisitionSurveyByOrderId } from "@/server/acquisition-surveys";

export const dynamic = "force-dynamic";

export default async function PurchasedReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: Promise<{ access?: string; proof?: string; t?: string }>;
}) {
  const [{ locale: requestedLocale, orderId }, query, auth, cookieStore] = await Promise.all([
    params,
    searchParams,
    requireSupabaseUser(),
    cookies(),
  ]);
  if ((!isLocale(requestedLocale) && requestedLocale !== "ja") || !/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) notFound();
  const locale = requestedLocale === "ja" ? "en" : requestedLocale;
  const requestedJapanese = requestedLocale === "ja";
  const admin = getSupabaseAdminClient();
  if (!admin) notFound();
  // A buyer coming back from the payment app carries the ticket in the return URL, and
  // the pass cookie covers later visits from the same browser.
  const now = new Date();
  const provenOrderId = readOrderTicket(query.t, now) ??
    readOrderPass(cookieStore.get(ORDER_PASS_COOKIE)?.value, now)?.orderId;
  const stored = await getAuthorizedStoredReport({
    admin,
    orderId,
    userId: auth.user?.id,
    accessToken: query.access,
    lookupProof: query.proof,
    provenOrderId: provenOrderId ?? undefined,
  });
  if (!stored) notFound();

  if (stored.status !== "ready" || !stored.report) {
    // A revoked report follows a cancellation or refund, so telling the reader to wait
    // would leave them expecting something that is never going to arrive.
    return (
      <main className="shell paid-report-shell" id="main-content">
        {stored.status === "pending_payment" ? (
          <PaymentStatusWaiting locale={requestedJapanese ? "ja" : locale} />
        ) : stored.status === "revoked" ? (
          <>
            <p className="eyebrow">{requestedJapanese ? "決済キャンセル" : locale === "ko" ? "결제 취소됨" : "Payment cancelled"}</p>
            <h1>
              {requestedJapanese ? "決済がキャンセルされたため、レポートの閲覧は終了しました。" : locale === "ko"
                ? "결제가 취소되어 리포트 열람이 종료되었습니다."
                : "This payment was cancelled, so the report is closed."}
            </h1>
            <p>
              {requestedJapanese ? "返金は元の決済手段に戻ります。反映まで数日かかる場合があります。" : locale === "ko"
                ? "환불은 결제하신 수단으로 처리됩니다. 반영까지 며칠 걸릴 수 있어요. 다시 보고 싶으시면 새로 결제해 주세요."
                : "The refund returns to your original payment method and can take a few days. Purchase again to receive a new report."}
            </p>
            <p className="report-link-order">
              {requestedJapanese ? "注文番号" : locale === "ko" ? "주문번호" : "Order number"} <code>{orderId}</code>
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">{requestedJapanese ? "レポート準備" : locale === "ko" ? "리포트 준비" : "Preparing report"}</p>
            <h1>
              {requestedJapanese ? "レポートの作成中に問題が発生しました。" : locale === "ko"
                ? "리포트를 만드는 중에 문제가 생겼습니다."
                : "Something went wrong while building the report."}
            </h1>
            <p>
              {requestedJapanese ? "決済は完了しています。下の注文番号を添えてお問い合わせください。" : locale === "ko"
                ? "결제는 정상 처리되었습니다. 아래 주문번호로 문의해 주시면 바로 도와드리겠습니다."
                : "Your payment went through. Please contact support with the order number below."}
            </p>
            <p className="report-link-order">
              {requestedJapanese ? "注文番号" : locale === "ko" ? "주문번호" : "Order number"} <code>{orderId}</code>
            </p>
          </>
        )}
        <p className="payment-result-links">
          <Link className="link-button" href={`/${locale}/support`}>
            {requestedJapanese ? "お問い合わせ" : locale === "ko" ? "문의하기" : "Contact support"}
          </Link>
          <Link className="link-button" href={`/${locale}`}>
            {requestedJapanese ? "ホーム" : locale === "ko" ? "홈으로" : "Home"}
          </Link>
        </p>
      </main>
    );
  }

  const report = stored.report;
  const japanese = requestedJapanese || report.displayLocale === "ja";
  // The reader has a completed reading open, which is the only moment asking for
  // feedback is fair. A missing review table (migration not yet applied) simply hides
  // the panel rather than failing the page the buyer paid for.
  const [existingReview, existingAcquisitionSurvey] = await Promise.all([
    findReviewByOrderId(admin, orderId),
    findAcquisitionSurveyByOrderId(admin, orderId),
  ]);
  const downloadParams = new URLSearchParams();
  if (query.access) downloadParams.set("access", query.access);
  if (query.proof) downloadParams.set("proof", query.proof);
  if (query.t) downloadParams.set("t", query.t);
  const accessQuery = downloadParams.size > 0 ? `?${downloadParams.toString()}` : "";
  // Carries this buyer's proof into the pass route, which is what opens the larger
  // features without an account.
  const passParams = new URLSearchParams({ locale, next: "compatibility" });
  if (query.access) passParams.set("access", query.access);
  if (query.proof) passParams.set("proof", query.proof);
  if (query.t) passParams.set("t", query.t);
  const compatibilityUrl = `/api/orders/${orderId}/pass?${passParams.toString()}`;
  const proTier = report.productCode !== "plus_30d";
  const basicV2 = report.sectionPlan === "basic-19000-v2" && report.calculationBasis;
  const detailV2 = report.sectionPlan === "detail-39000-v2" && report.calculationBasis;
  const premiumV2 = report.sectionPlan === "premium-79000-v2" && report.calculationBasis;
  const structuredV2 = basicV2 || detailV2 || premiumV2;
  const directSection = structuredV2
    ? report.sections.find((section) => section.title === (
        report.concern
          ? (locale === "ko" ? "질문에 대한 직접 결론" : "Direct answer")
          : (locale === "ko" ? "직접적인 인물 정의" : "Direct person definition")
      ))
    : undefined;
  const numberSection = structuredV2
    ? report.sections.find((section) => section.title === (locale === "ko" ? "핵심 숫자" : "Core numbers"))
    : undefined;
  const characterSection = structuredV2
    ? report.sections.find((section) =>
        locale === "ko"
          ? section.title === "캐릭터 한 문장" || section.title === "캐릭터 한 줄"
          : section.title === "Character in one line")
    : undefined;
  const stopSection = detailV2 || premiumV2
    ? report.sections.find((section) => section.title === (locale === "ko" ? "보류·중단·재검토 기준" : "Stop, hold, or reconsider"))
    : undefined;
  const premiumStopSection = premiumV2
    ? report.sections.find((section) => section.title === (locale === "ko" ? "보류·중단·전환 기준 6가지" : "Six hold, stop, or pivot conditions"))
    : undefined;
  const premiumManualSection = premiumV2
    ? report.sections.find((section) => section.title === (locale === "ko" ? "6단계 실행 매뉴얼" : "Six-step execution manual"))
    : undefined;
  const finalSection = structuredV2
    ? report.sections.find((section) => section.title === (
        premiumV2
          ? (locale === "ko" ? "현실적인 조언과 마무리" : "Grounded closing advice")
          : (locale === "ko" ? "최종 결론" : "Final conclusion")
      ))
    : undefined;
  const bodySections = structuredV2
    ? report.sections.filter((section) =>
        section !== directSection &&
        section !== numberSection &&
        section !== characterSection &&
        section !== stopSection &&
        section !== premiumStopSection &&
        section !== premiumManualSection &&
        section !== finalSection)
    : report.sections;
  const premiumExtensionStart = premiumV2
    ? bodySections.findIndex((section) => section.title === (
        locale === "ko" ? "네 숫자를 하나로 읽는 종합 해석" : "Cross-number synthesis"
      ))
    : -1;
  const foundationSections = premiumV2 && premiumExtensionStart >= 0
    ? bodySections.slice(0, premiumExtensionStart)
    : bodySections;
  const premiumExtensionSections = premiumV2 && premiumExtensionStart >= 0
    ? bodySections.slice(premiumExtensionStart)
    : [];
  const [birthYear, birthMonth, birthDay] = structuredV2
    ? structuredV2.birthDate.split("-").map(Number)
    : [0, 0, 0];
  const birthDateLabel = structuredV2
    ? (locale === "ko"
        ? `${birthYear}년 ${birthMonth}월 ${birthDay}일`
        : new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          }).format(new Date(`${structuredV2.birthDate}T00:00:00.000Z`)))
    : "";
  const numberValue = (value: number) =>
    value === 11 ? "11/2" : value === 22 ? "22/4" : value === 33 ? "33/6" : String(value);
  const characterLead = characterSection?.body
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim() && paragraph.trim() !== report.characterLabel)
    .at(0);
  // Every structured tier reads its numbers off the same calculation basis, so the strip
  // that used to be written out three times is built once here.
  const orbItems = structuredV2
    ? [
        { label: locale === "ko" ? "생명수" : "Life path", value: numberValue(structuredV2.lifePath) },
        { label: locale === "ko" ? "생일수" : "Birthday", value: numberValue(structuredV2.birthday) },
        { label: locale === "ko" ? "태도수" : "Attitude", value: numberValue(structuredV2.attitude) },
        { label: locale === "ko" ? "연도수" : "Birth year", value: numberValue(structuredV2.birthYear) },
        {
          label: locale === "ko" ? "개인년" : "Personal year",
          note: String(structuredV2.serviceYear),
          value: numberValue(structuredV2.personalYear),
        },
      ]
    : [];
  const chapterBadge = (index: number) =>
    japanese ? `第 ${index + 1} 章` : locale === "ko" ? `제 ${index + 1} 장` : `Chapter ${String(index + 1).padStart(2, "0")}`;
  const patternPersistenceEnabled = stored.owner_user_id === auth.user?.id;
  const deterministicBasis = report.calculationBasis
    ? `${locale === "ko" ? "결정론적 생년월일 패턴 계산" : "Deterministic numerology calculation"} · ${report.contentVersion ?? "stored-report"}`
    : (locale === "ko" ? "저장된 리포트의 계산 근거" : "Stored report calculation basis");
  const traditionalBasis = `${locale === "ko" ? "전통 상징 해석 계층" : "Traditional symbolic interpretation layer"} · ${report.sectionPlan ?? "legacy"}`;
  const patternSections = report.sections.map((section, index) => ({ index, title: section.title }));
  if (detailV2 || premiumV2) {
    return (
      <>
        <ReportViewBeacon locale={locale} productCode={report.productCode} />
        <DetailEditorialReport
          locale={locale}
          orderId={orderId}
          report={report}
          signedIn={patternPersistenceEnabled}
          footer={(
            <section className="webtoon-panel webtoon-paper webtoon-outro">
              <div className="webtoon-inner">
                <section>
                  <p className="eyebrow">{locale === "ko" ? "포함된 기능" : "Included"}</p>
                  <h2>{locale === "ko" ? "두 사람의 관계도 이어서 볼 수 있어요" : "Continue with a two-person relationship reading"}</h2>
                  <p>{locale === "ko" ? "상대방 생년월일을 입력하면 두 사람이 부딪히는 지점과 맞춰갈 조건을 확인합니다." : "Enter the other person's birth date to see friction points and practical conditions."}</p>
                  <p className="payment-result-links"><a className="primary-button" href={compatibilityUrl}>{locale === "ko" ? "궁합 보러 가기" : "Open compatibility"}</a></p>
                </section>
                <ReportActions locale={locale} downloadUrl={`/api/reports/${orderId}/download${accessQuery}`} />
                {existingAcquisitionSurvey.available && <AcquisitionSurveyPanel access={query.access} initialSurvey={existingAcquisitionSurvey.data} locale={locale} orderId={orderId} proof={query.proof} ticket={query.t} />}
                {existingReview.available && <ReviewRequestPanel access={query.access} existing={existingReview.data ? toOwnReviewState(existingReview.data) : null} locale={locale} orderId={orderId} proof={query.proof} ticket={query.t} />}
                <p className="paid-report-account-note">{locale === "ko" ? "이 페이지 주소와 내려받은 파일을 보관해 주세요. 주소를 잃어버려도 주문번호와 결제하신 휴대폰 번호로 다시 찾을 수 있어요." : "Keep this page address and downloaded file. You can recover it with the order number and checkout phone number."}</p>
                <p className="payment-result-links"><Link className="link-button" href={`/${locale}/orders`}>{locale === "ko" ? "구매 내역 확인" : "Find a purchase"}</Link></p>
              </div>
            </section>
          )}
        />
        <WebtoonCta href={`/api/reports/${orderId}/download${accessQuery}`} label={locale === "ko" ? "리포트 파일 내려받기" : "Download the report"} note={locale === "ko" ? `주문번호 ${orderId}` : `Order ${orderId}`} />
      </>
    );
  }
  return (
    <>
      <main
        className={`shell paid-report-shell webtoon-shell${basicV2 ? " basic-report-shell" : ""}${detailV2 ? " detail-report-shell" : ""}${premiumV2 ? " premium-report-shell" : ""}`}
        id="main-content"
      >
        <ReportViewBeacon locale={locale} productCode={report.productCode} />
        <WebtoonReveal />

        {/* The cover is a full screen of art with the title over it, opening the way the
            home page opens rather than as a header band. The reader arrives from a payment
            screen, and this is the moment the thing they bought is handed to them. The art
            is decorative — the title beside it carries the meaning. */}
        <section className="webtoon-cover" data-webtoon-panel="">
          <NightHorizon className="cinema-hero-scene" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" aria-hidden="true" className="webtoon-cover-art" src="/images/taeyul-hero.jpg" />
          <MeteorTrails className="cinema-hero-meteors" />
          <div className="cinema-hero-veil" aria-hidden="true" />

          <div className="cinema-hero-copy webtoon-cover-copy">
            <Link className="brand webtoon-cover-brand" href={`/${requestedJapanese ? "ja" : locale}`}>
              <strong>{brandNameForLocale(locale)}</strong>
            </Link>
            <p className="cinema-kicker">
              {report.tierLabel ?? (japanese ? "購入レポート" : locale === "ko" ? "구매 리포트" : "Purchased report")}
            </p>
            <h1 className="cinema-title">{report.title}</h1>
            {report.customerName && <p className="cinema-quote">{report.customerName}</p>}
            <small className="webtoon-cover-date">
              {new Intl.DateTimeFormat(japanese ? "ja-JP" : locale === "ko" ? "ko-KR" : "en-US").format(new Date(report.createdAt))}
            </small>
          </div>
          <WebtoonCue />
        </section>

        {structuredV2 ? (
          <WebtoonPanel
            badge={locale === "ko" ? "계산 기준" : "Basis"}
            lead={locale === "ko"
              ? `생년월일 ${birthDateLabel} · 적용 연도 ${structuredV2.serviceYear}`
              : `Birth date ${birthDateLabel} · Applied year ${structuredV2.serviceYear}`}
            title={report.concern
              ? (locale === "ko" ? "고객 질문" : "Your question")
              : (locale === "ko"
                  ? `${birthDateLabel}생 ${premiumV2 ? "프리미엄 심층 리포트" : detailV2 ? "상세 리포트" : "핵심 리포트"}`
                  : `${birthDateLabel} ${premiumV2 ? "premium in-depth report" : detailV2 ? "detailed report" : "core report"}`)}
            tone="paper"
          >
            {report.concern && <blockquote>{report.concern}</blockquote>}
          </WebtoonPanel>
        ) : (
          <WebtoonPanel
            badge={japanese ? "要約" : locale === "ko" ? "요약" : "Summary"}
            title={report.summary}
            tone="paper"
          >
            <blockquote>{report.concern}</blockquote>
          </WebtoonPanel>
        )}

        {/* The direct answer is the thing that was bought, so it gets a panel of its own
            instead of a subheading inside the summary card. */}
        {directSection && (
          <WebtoonPanel
            badge={locale === "ko" ? "결론" : "The answer"}
            title={directSection.title}
            tone="gold"
          >
            <p className="webtoon-body"><ReportEmphasis>{directSection.body}</ReportEmphasis></p>
            <WebtoonCue />
          </WebtoonPanel>
        )}

        {report.characterLabel && (
          <WebtoonPanel
            badge={locale === "ko" ? "캐릭터" : "Character"}
            title={report.characterLabel}
            tone="paper"
          >
            {characterLead && <p className="webtoon-body"><ReportEmphasis>{characterLead}</ReportEmphasis></p>}
          </WebtoonPanel>
        )}

        {/* The calculation comes after the reading, not before it: someone who just opened
            a report they paid for wants the answer, and the arithmetic behind it only once
            they have a reason to care. That order predates the webtoon layout and survives it. */}
        {structuredV2 && (
          <WebtoonPanel
            badge={locale === "ko" ? "숫자" : "Numbers"}
            title={locale === "ko" ? "핵심 숫자" : "Core numbers"}
            tone="night"
          >
            <WebtoonOrbs
              items={orbItems}
              label={locale === "ko" ? "계산된 핵심 숫자" : "Calculated core numbers"}
            />
            {numberSection && (
              <details>
                <summary>{locale === "ko" ? "계산 기준 보기" : "View the basis"}</summary>
                <p className="webtoon-body"><ReportEmphasis>{numberSection.body}</ReportEmphasis></p>
              </details>
            )}
          </WebtoonPanel>
        )}

        {foundationSections.map((section, index) => (
          <WebtoonPanel
            badge={chapterBadge(index)}
            key={section.title}
            title={section.title}
            tone={index % 2 === 0 ? "night" : "paper"}
          >
            {section.keySentence && (
              <p className="report-key-sentence"><strong>{section.keySentence}</strong></p>
            )}
            <p className="webtoon-body"><ReportEmphasis>{section.body}</ReportEmphasis></p>
            <ReportRealityCheck
              deterministicBasis={deterministicBasis}
              locale={locale}
              orderId={orderId}
              personalized={Boolean(report.concern)}
              sectionIndex={report.sections.indexOf(section)}
              signedIn={patternPersistenceEnabled}
              traditionalBasis={traditionalBasis}
            />
          </WebtoonPanel>
        ))}

        <WebtoonPanel
          badge={japanese ? "実行" : locale === "ko" ? "실행" : "Action"}
          title={detailV2 || premiumV2
            ? (locale === "ko" ? "우선 실행 계획" : "Prioritized execution plan")
            : (japanese ? "今から試すこと" : locale === "ko" ? "지금 해볼 일" : "Next actions")}
          tone="gold"
        >
          <ol className="webtoon-steps">{report.actions.map((item) => <li key={item}><ReportEmphasis>{item}</ReportEmphasis></li>)}</ol>
          {premiumManualSection && (
            <div className="premium-manual">
              <h3>{premiumManualSection.title}</h3>
              <p className="webtoon-body"><ReportEmphasis>{premiumManualSection.body}</ReportEmphasis></p>
            </div>
          )}
        </WebtoonPanel>

        {stopSection && (
          <WebtoonPanel
            badge={locale === "ko" ? "멈춤 신호" : "Stop signal"}
            title={stopSection.title}
            tone="warn"
          >
            <p className="webtoon-body"><ReportEmphasis>{stopSection.body}</ReportEmphasis></p>
          </WebtoonPanel>
        )}

        {premiumStopSection && (
          <WebtoonPanel
            badge={locale === "ko" ? "멈춤 신호" : "Stop signal"}
            title={premiumStopSection.title}
            tone="warn"
          >
            <p className="webtoon-body"><ReportEmphasis>{premiumStopSection.body}</ReportEmphasis></p>
          </WebtoonPanel>
        )}

        {premiumExtensionSections.map((section, index) => {
          const progressive = /시나리오 확인 신호|위험 방지 체크리스트|Signals that confirm|Risk-prevention checklist/.test(section.title);
          // A checklist is something the reader opens when they are ready to work through
          // it, so it stays folded away inside its panel rather than unrolling mid-scroll.
          return progressive ? (
            <WebtoonPanel
              badge={locale === "ko" ? "체크 장면" : "Check scene"}
              key={section.title}
              title={section.title}
              tone="paper"
            >
              <details className="premium-progressive">
                <summary>{locale === "ko" ? "내용 펼치기" : "Open checklist"}</summary>
                <p className="webtoon-body"><ReportEmphasis>{section.body}</ReportEmphasis></p>
              </details>
            </WebtoonPanel>
          ) : (
            <WebtoonPanel
              badge={locale === "ko" ? "심층" : "In depth"}
              key={section.title}
              title={section.title}
              tone={index % 2 === 0 ? "night" : "paper"}
            >
              <p className="webtoon-body"><ReportEmphasis>{section.body}</ReportEmphasis></p>
            </WebtoonPanel>
          );
        })}

        {finalSection && (
          <WebtoonPanel
            badge={locale === "ko" ? "마무리" : "Closing"}
            title={finalSection.title}
            tone="night"
          >
            <p className="webtoon-body"><ReportEmphasis>{finalSection.body}</ReportEmphasis></p>
          </WebtoonPanel>
        )}

        {!structuredV2 && (
          <WebtoonPanel
            badge={japanese ? "注意" : locale === "ko" ? "주의" : "Caution"}
            title={japanese ? "このような時は立ち止まってください" : locale === "ko" ? "이럴 때는 조심하세요" : "Situations to watch"}
            tone="warn"
          >
            <ul>{report.cautions.map((item) => <li key={item}><ReportEmphasis>{item}</ReportEmphasis></li>)}</ul>
          </WebtoonPanel>
        )}

        {(detailV2 || premiumV2) && report.cautions.length > 0 && (
          <WebtoonPanel
            badge={locale === "ko" ? "안전" : "Safety"}
            title={locale === "ko" ? "먼저 확인할 안전 기준" : "Safety check"}
            tone="warn"
          >
            <ul>{report.cautions.map((item) => <li key={item}><ReportEmphasis>{item}</ReportEmphasis></li>)}</ul>
          </WebtoonPanel>
        )}

        {proTier && (
          <WebtoonPanel
            badge={japanese ? "含まれる機能" : locale === "ko" ? "함께 볼 수 있어요" : "Also included"}
            title={japanese ? "二人の相性" : locale === "ko" ? "두 사람 궁합" : "Two-person compatibility"}
            tone="gold"
          >
            <p>
              {japanese ? "この商品には二人の相性リーディングが含まれています。相手の生年月日があれば利用できます。" : locale === "ko"
                ? "이 상품에는 두 사람 궁합 보기가 포함되어 있어요. 상대방 생년월일만 있으면 바로 볼 수 있습니다."
                : "This purchase includes two-person compatibility. You only need the other person's birth date."}
            </p>
            <p className="payment-result-links">
              <a className="primary-button" href={compatibilityUrl}>
                {japanese ? "相性を見る" : locale === "ko" ? "궁합 보러 가기" : "Open compatibility"}
              </a>
            </p>
          </WebtoonPanel>
        )}

        {/* Everything that is housekeeping rather than reading lands together in one quiet
            panel, so the closing beat above is the last thing the reading itself says. */}
        <section className="webtoon-panel webtoon-paper webtoon-outro" data-webtoon-panel="">
          <div className="webtoon-inner">
            <p className="disclaimer">{report.disclaimer}</p>
            <EvidenceEventCapture
              locale={japanese ? "ja" : locale}
              orderId={orderId}
              sections={patternSections}
              signedIn={patternPersistenceEnabled}
            />
            <ReportActions
              locale={japanese ? "ja" : locale}
              downloadUrl={`/api/reports/${orderId}/download${accessQuery}`}
            />
            {!japanese && existingAcquisitionSurvey.available && (
              <AcquisitionSurveyPanel
                access={query.access}
                initialSurvey={existingAcquisitionSurvey.data}
                locale={locale}
                orderId={orderId}
                proof={query.proof}
                ticket={query.t}
              />
            )}
            {!japanese && existingReview.available && (
              <ReviewRequestPanel
                access={query.access}
                existing={existingReview.data ? toOwnReviewState(existingReview.data) : null}
                locale={locale}
                orderId={orderId}
                proof={query.proof}
                ticket={query.t}
              />
            )}
            <p className="paid-report-account-note">
              {japanese ? "このページのURLとダウンロードしたファイルを保管してください。URLを失っても、注文番号と決済時の電話番号で探せます。" : locale === "ko"
                ? "이 페이지 주소와 내려받은 파일을 보관해 주세요. 주소를 잃어버려도 주문번호와 결제하신 휴대폰 번호로 다시 찾을 수 있어요."
                : "Keep this page address and the downloaded file. If you lose the address, you can find it again with your order number and the phone number used at checkout."}
            </p>
            <p className="payment-result-links">
              <Link className="link-button" href={`/${locale}/orders`}>
                {japanese ? "購入履歴を確認" : locale === "ko" ? "구매 내역 확인" : "Find a purchase"}
              </Link>
            </p>
          </div>
        </section>
      </main>
      <WebtoonCta
        href={`/api/reports/${orderId}/download${accessQuery}`}
        label={japanese ? "レポートをダウンロード" : locale === "ko" ? "리포트 파일 내려받기" : "Download the report"}
        note={japanese ? `注文番号 ${orderId}` : locale === "ko" ? `주문번호 ${orderId}` : `Order ${orderId}`}
      />
    </>
  );
}
