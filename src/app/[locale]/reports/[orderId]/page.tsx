import Link from "next/link";
import { notFound } from "next/navigation";
import { PaymentStatusWaiting } from "@/components/payment-status-waiting";
import { ReportActions } from "@/components/report-actions";
import { isLocale } from "@/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { getAuthorizedStoredReport } from "@/server/reports/access";

export const dynamic = "force-dynamic";

export default async function PurchasedReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; orderId: string }>;
  searchParams: Promise<{ access?: string; proof?: string }>;
}) {
  const [{ locale, orderId }, query, auth] = await Promise.all([
    params,
    searchParams,
    requireSupabaseUser(),
  ]);
  if (!isLocale(locale) || !/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) notFound();
  const admin = getSupabaseAdminClient();
  if (!admin) notFound();
  const stored = await getAuthorizedStoredReport({
    admin,
    orderId,
    userId: auth.user?.id,
    accessToken: query.access,
    lookupProof: query.proof,
  });
  if (!stored) notFound();

  if (stored.status !== "ready" || !stored.report) {
    return (
      <main className="shell paid-report-shell" id="main-content">
        {stored.status === "pending_payment" ? (
          <PaymentStatusWaiting locale={locale} />
        ) : (
          <>
            <p className="eyebrow">{locale === "ko" ? "리포트 준비" : "Preparing report"}</p>
            <h1>{locale === "ko" ? "리포트를 준비하고 있습니다." : "The report is being prepared."}</h1>
            <p>{locale === "ko" ? "잠시 후 이 페이지를 다시 열어 주세요." : "Please open this page again shortly."}</p>
          </>
        )}
      </main>
    );
  }

  const report = stored.report;
  const accessQuery = query.access ? `?access=${encodeURIComponent(query.access)}` : "";
  // Carries this buyer's proof into the pass route, which is what opens the larger
  // features without an account.
  const passParams = new URLSearchParams({ locale, next: "compatibility" });
  if (query.access) passParams.set("access", query.access);
  if (query.proof) passParams.set("proof", query.proof);
  const compatibilityUrl = `/api/orders/${orderId}/pass?${passParams.toString()}`;
  const proTier = report.productCode !== "plus_30d";
  return (
    <main className="shell paid-report-shell" id="main-content">
      <header className="paid-report-header">
        <Link className="brand" href={`/${locale}`}><strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong></Link>
        <p className="eyebrow">{locale === "ko" ? "구매 리포트" : "Purchased report"}</p>
        <h1>{report.title}</h1>
        {report.customerName && <p>{report.customerName}</p>}
        <small>{new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US").format(new Date(report.createdAt))}</small>
      </header>
      <section className="paid-report-summary">
        <h2>{report.summary}</h2>
        <blockquote>{report.concern}</blockquote>
      </section>
      {report.sections.map((section) => (
        <section className="paid-report-section" key={section.title}>
          <h2>{section.title}</h2><p>{section.body}</p>
        </section>
      ))}
      <section className="paid-report-section">
        <h2>{locale === "ko" ? "지금 해볼 일" : "Next actions"}</h2>
        <ul>{report.actions.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="paid-report-section caution">
        <h2>{locale === "ko" ? "이럴 때는 조심하세요" : "Situations to watch"}</h2>
        <ul>{report.cautions.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <p className="disclaimer">{report.disclaimer}</p>
      <ReportActions
        locale={locale}
        downloadUrl={`/api/reports/${orderId}/download${accessQuery}`}
      />
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
