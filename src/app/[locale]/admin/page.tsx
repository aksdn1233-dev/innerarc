import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminCancelButton } from "@/components/admin-cancel-button";
import { AdminDepositButton } from "@/components/admin-deposit-button";
import { AdminInquiryList, type AdminInquiry } from "@/components/admin-inquiry-list";
import { AdminMetricsPanel } from "@/components/admin-metrics-panel";
import { AdminOperationsPanel } from "@/components/admin-operations-panel";
import { AdminPaymentReadinessPanel } from "@/components/admin-payment-readiness-panel";
import { summarizeOrders, type OrderRow } from "@/server/admin-metrics";
import { isLocale } from "@/i18n/config";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";
import { describePaymentSetup } from "@/server/payments/diagnostics";
import {
  DEFAULT_OPERATIONS_GATE,
  launchApprovalFrom,
  readOperationsGate,
  readRecentPaymentSetupEvents,
} from "@/server/payments/gate";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const auth = await requireSupabaseUser();
  // Signed out goes to the console's own sign-in. A signed-in non-administrator still
  // gets a 404, so the console never confirms its own existence to a stranger.
  if (!auth.user) redirect(`/${locale}/admin/login`);
  if (!isAdminEmail(auth.user.email)) notFound();
  // The console is the one screen that has to survive a broken database connection,
  // because that is exactly the failure it exists to explain. Previously a bad or
  // missing service-role key threw here, so the operator lost the diagnosis at the
  // moment they needed it and saw only a crash.
  const admin = resolveSupabaseAdminClient().client;
  if (!admin) {
    const readiness = describePaymentSetup({
      launchApproval: launchApprovalFrom(DEFAULT_OPERATIONS_GATE),
      salesEnabled: DEFAULT_OPERATIONS_GATE.salesEnabled,
      databaseReachable: false,
    });
    return (
      <main className="shell admin-shell" id="main-content">
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}><strong>결 GYEOL</strong><small>관리자</small></Link>
        </header>
        <section className="admin-hero">
          <p className="eyebrow">OWNER CONSOLE</p>
          <h1>데이터베이스에 연결하지 못했습니다</h1>
          <p>로그인 계정: {auth.user.email}</p>
          <p>
            주문·리포트·문의는 데이터베이스가 연결된 뒤에 표시됩니다. 아래에서 어떤
            값을 고쳐야 하는지 확인하세요.
          </p>
        </section>
        <AdminPaymentReadinessPanel
          gate={DEFAULT_OPERATIONS_GATE}
          recentFailures={[]}
          report={readiness}
        />
      </main>
    );
  }

  const [
    orders,
    reports,
    settings,
    inquiries,
    openInquiries,
    paidOrders,
    gate,
    recentFailures,
  ] = await Promise.all([
    admin
      .from("payment_orders")
      .select(
        "order_id,product_code,provider,amount,status,manual_depositor_name,deposit_deadline,created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .limit(20),
    admin.from("purchased_reports").select("status", { count: "exact" }),
    admin.from("admin_settings").select("sales_enabled,notice").eq("id", 1).maybeSingle(),
    admin
      .from("support_inquiries")
      .select("id,order_id,category,contact,message,status,admin_note,created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    admin
      .from("support_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    admin
      .from("payment_orders")
      .select("amount")
      .eq("status", "DONE"),
    readOperationsGate(admin),
    readRecentPaymentSetupEvents(admin, 10),
  ]);
  const revenue = (paidOrders.data ?? []).reduce((total, row) => total + (row.amount ?? 0), 0);

  const METRIC_DAYS = 30;
  const now = new Date();
  const since = new Date(now.getTime() - METRIC_DAYS * 24 * 60 * 60 * 1_000).toISOString();
  const recent = await admin
    .from("payment_orders")
    .select("product_code,amount,status,provider,created_at")
    .gte("created_at", since);
  const metrics = summarizeOrders((recent.data ?? []) as OrderRow[], {
    now,
    days: METRIC_DAYS,
  });

  // A buyer whose report failed to build has paid and is looking at an error screen.
  // Nothing surfaced that anywhere, so it could sit unnoticed indefinitely.
  const { data: stuckReports } = await admin
    .from("purchased_reports")
    .select("order_id,product_code,status,created_at")
    .eq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(20);
  const readiness = describePaymentSetup({
    launchApproval: launchApprovalFrom(gate),
    salesEnabled: gate.salesEnabled,
    databaseReachable: gate.reachable,
  });

  return (
    <main className="shell admin-shell" id="main-content">
      <header className="topbar">
        <Link className="brand" href={`/${locale}`}><strong>결 GYEOL</strong><small>관리자</small></Link>
        <Link href={`/${locale}/orders`}>주문조회</Link>
      </header>
      <section className="admin-hero">
        <p className="eyebrow">OWNER CONSOLE</p>
        <h1>운영 관리자</h1>
        <p>로그인 계정: {auth.user.email}</p>
      </section>
      <section className="admin-stat-grid">
        <article><strong>{orders.count ?? 0}</strong><span>전체 주문</span></article>
        <article>
          <strong>{new Intl.NumberFormat("ko-KR").format(revenue)}원</strong>
          <span>결제 완료 합계</span>
        </article>
        <article><strong>{reports.count ?? 0}</strong><span>전체 리포트</span></article>
        <article><strong>{openInquiries.count ?? 0}</strong><span>미처리 문의</span></article>
        <article><strong>{readiness.open ? "열림" : "닫힘"}</strong><span>결제 설정</span></article>
        <article>
          <strong>{settings.data?.sales_enabled === false ? "중지" : "접수중"}</strong>
          <span>신규 판매</span>
        </article>
      </section>
      <AdminMetricsPanel days={METRIC_DAYS} metrics={metrics} />
      <AdminPaymentReadinessPanel
        gate={gate}
        recentFailures={recentFailures}
        report={readiness}
      />
      <AdminOperationsPanel
        initialSalesEnabled={settings.data?.sales_enabled ?? true}
        initialNotice={settings.data?.notice ?? ""}
      />
      <section className="admin-orders">
        <h2>최근 주문</h2>
        <div className="admin-order-list">
          {(orders.data ?? []).map((order) => (
            <div key={order.order_id}>
              <code>{order.order_id}</code>
              <span>
                {order.product_code}
                {order.manual_depositor_name ? ` · ${order.manual_depositor_name}` : ""}
              </span>
              <strong>{new Intl.NumberFormat("ko-KR").format(order.amount)}원</strong>
              <span>
                {order.status}
                {order.provider === "manual_transfer" &&
                  order.status === "WAITING_FOR_DEPOSIT" && (
                    <AdminDepositButton orderId={order.order_id} />
                  )}
                {order.provider === "payapp" && order.status === "DONE" && (
                  <AdminCancelButton orderId={order.order_id} />
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
      {(stuckReports ?? []).length > 0 && (
        <section className="admin-orders">
          <h2>⚠ 리포트 생성 실패 — 결제는 되었으나 열람 불가</h2>
          <p className="plans-notice">
            이 주문들은 결제가 처리된 뒤 리포트를 만들지 못했습니다. 고객이 오류
            화면을 보고 있으니 환불하거나 직접 연락해 주세요.
          </p>
          <div className="admin-order-list">
            {(stuckReports ?? []).map((report) => (
              <div key={report.order_id}>
                <code>{report.order_id}</code>
                <span>{report.product_code}</span>
                <span>{new Date(report.created_at).toLocaleString("ko-KR")}</span>
                <AdminCancelButton orderId={report.order_id} />
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="admin-orders">
        <h2>고객 문의</h2>
        <AdminInquiryList inquiries={(inquiries.data ?? []) as AdminInquiry[]} />
      </section>
    </main>
  );
}
