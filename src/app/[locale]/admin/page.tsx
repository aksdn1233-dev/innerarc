import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDepositButton } from "@/components/admin-deposit-button";
import { AdminOperationsPanel } from "@/components/admin-operations-panel";
import { isLocale } from "@/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";
import { inspectPaymentReadiness } from "@/server/payments/config";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const auth = await requireSupabaseUser();
  if (!auth.user || !isAdminEmail(auth.user.email)) notFound();
  const admin = getSupabaseAdminClient();
  if (!admin) notFound();

  const [orders, reports, settings] = await Promise.all([
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
  ]);
  const readiness = inspectPaymentReadiness();

  return (
    <main className="shell admin-shell" id="main-content">
      <header className="topbar">
        <Link className="brand" href={`/${locale}`}><strong>InnerArc</strong><small>관리자</small></Link>
        <Link href={`/${locale}/me`}>마이페이지</Link>
      </header>
      <section className="admin-hero">
        <p className="eyebrow">OWNER CONSOLE</p>
        <h1>운영 관리자</h1>
        <p>로그인 계정: {auth.user.email}</p>
      </section>
      <section className="admin-stat-grid">
        <article><strong>{orders.count ?? 0}</strong><span>전체 주문</span></article>
        <article><strong>{reports.count ?? 0}</strong><span>전체 리포트</span></article>
        <article><strong>{readiness.enabled ? "정상" : "닫힘"}</strong><span>결제 설정</span></article>
      </section>
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
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
