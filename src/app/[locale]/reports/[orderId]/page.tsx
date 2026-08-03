import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ORDER_PASS_COOKIE, readOrderPass, readOrderTicket } from "@/server/order-pass";
import { PaymentStatusWaiting } from "@/components/payment-status-waiting";
import { ReportActions } from "@/components/report-actions";
import { ReviewRequestPanel } from "@/components/review-request-panel";
import { toOwnReviewState } from "@/core/reviews";
import { isLocale } from "@/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { getAuthorizedStoredReport } from "@/server/reports/access";
import { findReviewByOrderId } from "@/server/reviews";

export const dynamic = "force-dynamic";

export default async function PurchasedReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: Promise<{ access?: string; proof?: string; t?: string }>;
}) {
  const [{ locale, orderId }, query, auth, cookieStore] = await Promise.all([
    params,
    searchParams,
    requireSupabaseUser(),
    cookies(),
  ]);
  if (!isLocale(locale) || !/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) notFound();
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
          <PaymentStatusWaiting locale={locale} />
        ) : stored.status === "revoked" ? (
          <>
            <p className="eyebrow">{locale === "ko" ? "결제 취소됨" : "Payment cancelled"}</p>
            <h1>
              {locale === "ko"
                ? "결제가 취소되어 리포트 열람이 종료되었습니다."
                : "This payment was cancelled, so the report is closed."}
            </h1>
            <p>
              {locale === "ko"
                ? "환불은 결제하신 수단으로 처리됩니다. 반영까지 며칠 걸릴 수 있어요. 다시 보고 싶으시면 새로 결제해 주세요."
                : "The refund returns to your original payment method and can take a few days. Purchase again to receive a new report."}
            </p>
            <p className="report-link-order">
              {locale === "ko" ? "주문번호" : "Order number"} <code>{orderId}</code>
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">{locale === "ko" ? "리포트 준비" : "Preparing report"}</p>
            <h1>
              {locale === "ko"
                ? "리포트를 만드는 중에 문제가 생겼습니다."
                : "Something went wrong while building the report."}
            </h1>
            <p>
              {locale === "ko"
                ? "결제는 정상 처리되었습니다. 아래 주문번호로 문의해 주시면 바로 도와드리겠습니다."
                : "Your payment went through. Please contact support with the order number below."}
            </p>
            <p className="report-link-order">
              {locale === "ko" ? "주문번호" : "Order number"} <code>{orderId}</code>
            </p>
          </>
        )}
        <p className="payment-result-links">
          <Link className="link-button" href={`/${locale}/support`}>
            {locale === "ko" ? "문의하기" : "Contact support"}
          </Link>
          <Link className="link-button" href={`/${locale}`}>
            {locale === "ko" ? "홈으로" : "Home"}
          </Link>
        </p>
      </main>
    );
  }

  const report = stored.report;
  // The reader has a completed reading open, which is the only moment asking for
  // feedback is fair. A missing review table (migration not yet applied) simply hides
  // the panel rather than failing the page the buyer paid for.
  const existingReview = await findReviewByOrderId(admin, orderId);
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
  const deepBasis = report.calculationBasis!;
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
  return (
    <main
      className={`shell paid-report-shell${basicV2 ? " basic-report-shell" : ""}${detailV2 ? " detail-report-shell" : ""}${premiumV2 ? " premium-report-shell" : ""}`}
      id="main-content"
    >
      <header className="paid-report-header">
        <Link className="brand" href={`/${locale}`}><strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong></Link>
        <p className="eyebrow">
          {report.tierLabel ?? (locale === "ko" ? "구매 리포트" : "Purchased report")}
        </p>
        <h1>{report.title}</h1>
        {report.customerName && <p>{report.customerName}</p>}
        <small>{new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US").format(new Date(report.createdAt))}</small>
      </header>
      {basicV2 ? (
        <section className="paid-report-summary basic-report-summary">
          <p className="basic-report-basis">
            {locale === "ko"
              ? `생년월일 ${birthDateLabel} · 적용 연도 ${basicV2.serviceYear}`
              : `Birth date ${birthDateLabel} · Applied year ${basicV2.serviceYear}`}
          </p>
          <h2>
            {report.concern
              ? (locale === "ko" ? "고객 질문" : "Your question")
              : (locale === "ko" ? `${birthDateLabel}생 핵심 리포트` : `${birthDateLabel} core report`)}
          </h2>
          {report.concern && <blockquote>{report.concern}</blockquote>}
          {directSection && (
            <div className="basic-direct-answer">
              <h2>{directSection.title}</h2>
              <p>{directSection.body}</p>
            </div>
          )}
          <div
            className="basic-number-strip"
            aria-label={locale === "ko" ? "계산된 핵심 숫자" : "Calculated core numbers"}
          >
            <span>{locale === "ko" ? "생명수" : "Life"} <strong>{numberValue(basicV2.lifePath)}</strong></span>
            <span>{locale === "ko" ? "생일수" : "Birthday"} <strong>{numberValue(basicV2.birthday)}</strong></span>
            <span>{locale === "ko" ? "태도수" : "Attitude"} <strong>{numberValue(basicV2.attitude)}</strong></span>
            <span>{locale === "ko" ? "연도수" : "Birth year"} <strong>{numberValue(basicV2.birthYear)}</strong></span>
            <span>{basicV2.serviceYear} {locale === "ko" ? "개인년" : "Personal year"} <strong>{numberValue(basicV2.personalYear)}</strong></span>
          </div>
          {report.characterLabel && (
            <p className="paid-report-character-label">{report.characterLabel}</p>
          )}
          {characterLead && <p className="basic-character-lead">{characterLead}</p>}
        </section>
      ) : detailV2 || premiumV2 ? (
        <section className={`paid-report-summary detail-report-summary${premiumV2 ? " premium-report-summary" : ""}`}>
          <p className="detail-report-basis">
            {locale === "ko"
              ? `생년월일 ${birthDateLabel} · 적용 연도 ${deepBasis.serviceYear}`
              : `Birth date ${birthDateLabel} · Applied year ${deepBasis.serviceYear}`}
          </p>
          <h2>
            {report.concern
              ? (locale === "ko" ? "고객 질문" : "Your question")
              : (locale === "ko"
                  ? `${birthDateLabel}생 ${premiumV2 ? "프리미엄 심층 리포트" : "상세 리포트"}`
                  : `${birthDateLabel} ${premiumV2 ? "premium in-depth report" : "detailed report"}`)}
          </h2>
          {report.concern && <blockquote>{report.concern}</blockquote>}
          {directSection && (
            <div className="detail-direct-answer">
              <h2>{directSection.title}</h2>
              <p>{directSection.body}</p>
            </div>
          )}
          {report.characterLabel && (
            <p className="paid-report-character-label">{report.characterLabel}</p>
          )}
          {characterLead && <p className="detail-character-lead">{characterLead}</p>}
          <details className="detail-number-details">
            <summary>{locale === "ko" ? "핵심 숫자와 계산 기준 보기" : "View core numbers and basis"}</summary>
            <div
              className="detail-number-strip"
              aria-label={locale === "ko" ? "계산된 핵심 숫자" : "Calculated core numbers"}
            >
              <span>{locale === "ko" ? "생명수" : "Life"} <strong>{numberValue(deepBasis.lifePath)}</strong></span>
              <span>{locale === "ko" ? "생일수" : "Birthday"} <strong>{numberValue(deepBasis.birthday)}</strong></span>
              <span>{locale === "ko" ? "태도수" : "Attitude"} <strong>{numberValue(deepBasis.attitude)}</strong></span>
              <span>{locale === "ko" ? "연도수" : "Birth year"} <strong>{numberValue(deepBasis.birthYear)}</strong></span>
              <span>{deepBasis.serviceYear} {locale === "ko" ? "개인년" : "Personal year"} <strong>{numberValue(deepBasis.personalYear)}</strong></span>
            </div>
            {numberSection && <p>{numberSection.body}</p>}
          </details>
        </section>
      ) : (
        <section className="paid-report-summary">
          <h2>{report.summary}</h2>
          <blockquote>{report.concern}</blockquote>
          {report.characterLabel && (
            <p className="paid-report-character-label">{report.characterLabel}</p>
          )}
        </section>
      )}
      {foundationSections.map((section) => (
        <section className="paid-report-section" key={section.title}>
          <h2>{section.title}</h2><p>{section.body}</p>
        </section>
      ))}
      <section className={`paid-report-section${basicV2 ? " basic-report-actions" : ""}${detailV2 || premiumV2 ? " detail-report-actions" : ""}${premiumV2 ? " premium-report-actions" : ""}`}>
        <h2>
          {detailV2 || premiumV2
            ? (locale === "ko" ? "우선 실행 계획" : "Prioritized execution plan")
            : (locale === "ko" ? "지금 해볼 일" : "Next actions")}
        </h2>
        <ul>{report.actions.map((item) => <li key={item}>{item}</li>)}</ul>
        {premiumManualSection && (
          <div className="premium-manual">
            <h3>{premiumManualSection.title}</h3>
            <p>{premiumManualSection.body}</p>
          </div>
        )}
      </section>
      {stopSection && (
        <section className="paid-report-section detail-report-stop">
          <h2>{stopSection.title}</h2><p>{stopSection.body}</p>
        </section>
      )}
      {premiumStopSection && (
        <section className="paid-report-section detail-report-stop premium-report-stop">
          <h2>{premiumStopSection.title}</h2><p>{premiumStopSection.body}</p>
        </section>
      )}
      {premiumExtensionSections.map((section) => {
        const progressive = /시나리오 확인 신호|위험 방지 체크리스트|Signals that confirm|Risk-prevention checklist/.test(section.title);
        return progressive ? (
          <details className="paid-report-section premium-progressive" key={section.title}>
            <summary>{section.title}</summary><p>{section.body}</p>
          </details>
        ) : (
          <section className="paid-report-section premium-report-extension" key={section.title}>
            <h2>{section.title}</h2><p>{section.body}</p>
          </section>
        );
      })}
      {finalSection && (
        <section className={`paid-report-section${detailV2 || premiumV2 ? " detail-report-final" : " basic-report-final"}${premiumV2 ? " premium-report-final" : ""}`}>
          <h2>{finalSection.title}</h2><p>{finalSection.body}</p>
        </section>
      )}
      {!structuredV2 && (
        <section className="paid-report-section caution">
          <h2>{locale === "ko" ? "이럴 때는 조심하세요" : "Situations to watch"}</h2>
          <ul>{report.cautions.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}
      {(detailV2 || premiumV2) && report.cautions.length > 0 && (
        <section className="paid-report-section caution detail-report-caution">
          <h2>{locale === "ko" ? "먼저 확인할 안전 기준" : "Safety check"}</h2>
          <ul>{report.cautions.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}
      <p className="disclaimer">{report.disclaimer}</p>
      <ReportActions
        locale={locale}
        downloadUrl={`/api/reports/${orderId}/download${accessQuery}`}
      />
      {existingReview.available && (
        <ReviewRequestPanel
          access={query.access}
          existing={existingReview.data ? toOwnReviewState(existingReview.data) : null}
          locale={locale}
          orderId={orderId}
          proof={query.proof}
          ticket={query.t}
        />
      )}
      {proTier && (
        <section className="report-link-card">
          <p className="eyebrow">{locale === "ko" ? "함께 볼 수 있어요" : "Also included"}</p>
          <p>
            {locale === "ko"
              ? "이 상품에는 두 사람 궁합 보기가 포함되어 있어요. 상대방 생년월일만 있으면 바로 볼 수 있습니다."
              : "This purchase includes two-person compatibility. You only need the other person's birth date."}
          </p>
          <a className="primary-button" href={compatibilityUrl}>
            {locale === "ko" ? "궁합 보러 가기" : "Open compatibility"}
          </a>
        </section>
      )}
      <p className="paid-report-account-note">
        {locale === "ko"
          ? "이 페이지 주소와 내려받은 파일을 보관해 주세요. 주소를 잃어버려도 주문번호와 결제하신 휴대폰 번호로 다시 찾을 수 있어요."
          : "Keep this page address and the downloaded file. If you lose the address, you can find it again with your order number and the phone number used at checkout."}
      </p>
      <p className="payment-result-links">
        <Link className="link-button" href={`/${locale}/orders`}>
          {locale === "ko" ? "구매 내역 확인" : "Find a purchase"}
        </Link>
      </p>
    </main>
  );
}
