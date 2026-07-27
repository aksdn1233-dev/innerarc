import Link from "next/link";
import { notFound } from "next/navigation";
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
  searchParams: Promise<{ access?: string }>;
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
  });
  if (!stored) notFound();

  if (stored.status !== "ready" || !stored.report) {
    return (
      <main className="shell paid-report-shell" id="main-content">
        <p className="eyebrow">{locale === "ko" ? "결제 확인" : "Payment status"}</p>
        <h1>
          {stored.status === "pending_payment"
            ? locale === "ko" ? "입금 확인을 기다리고 있습니다." : "Waiting for payment confirmation."
            : locale === "ko" ? "리포트를 준비하고 있습니다." : "The report is being prepared."}
        </h1>
        <p>{locale === "ko" ? "잠시 후 이 페이지를 다시 열어 주세요." : "Please open this page again shortly."}</p>
      </main>
    );
  }

  const report = stored.report;
  const accessQuery = query.access ? `?access=${encodeURIComponent(query.access)}` : "";
  return (
    <main className="shell paid-report-shell" id="main-content">
      <header className="paid-report-header">
        <Link className="brand" href={`/${locale}`}><strong>InnerArc</strong></Link>
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
      <p className="paid-report-account-note">
        {auth.user
          ? locale === "ko" ? "이 리포트는 마이페이지에도 저장되어 있습니다." : "This report is saved in My Page."
          : locale === "ko"
            ? "비회원 구매 리포트입니다. 이 페이지 주소와 내려받은 파일을 안전하게 보관해 주세요."
            : "This is a guest purchase. Keep this page address and downloaded file safe."}
      </p>
    </main>
  );
}
