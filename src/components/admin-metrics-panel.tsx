import type { AdminMetrics } from "@/server/admin-metrics";

const PRODUCT_LABEL: Record<string, string> = {
  plus_30d: "핵심 리딩 (판매 중지·기존 주문)",
  pro_30d: "상세 리딩 (9,600원)",
  premium_pdf: "프리미엄 심층 리딩 (39,000원)",
};

function won(amount: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}

export function AdminMetricsPanel({
  metrics,
  days,
}: {
  metrics: AdminMetrics;
  days: number;
}) {
  const busiest = Math.max(1, ...metrics.daily.map((day) => day.started));

  return (
    <section className="admin-metrics">
      <h2>최근 {days}일 운영 현황</h2>

      <div className="admin-funnel">
        <article>
          <strong>{metrics.started}</strong>
          <span>결제창까지 간 주문</span>
        </article>
        <article className="is-good">
          <strong>{metrics.paid}</strong>
          <span>결제 완료</span>
        </article>
        <article>
          <strong>{metrics.awaitingDeposit}</strong>
          <span>입금 대기</span>
        </article>
        <article>
          <strong>{metrics.abandoned}</strong>
          <span>결제 안 하고 이탈</span>
        </article>
        <article className="is-warn">
          <strong>{metrics.cancelled}</strong>
          <span>취소·환불</span>
        </article>
      </div>

      <div className="admin-stat-grid">
        <article><strong>{won(metrics.revenue)}</strong><span>결제 금액</span></article>
        <article><strong>{won(metrics.refunded)}</strong><span>환불 금액</span></article>
        <article><strong>{metrics.conversionRate}%</strong><span>결제 전환율</span></article>
        <article><strong>{metrics.cancelRate}%</strong><span>취소율</span></article>
        <article><strong>{won(metrics.averageOrderValue)}</strong><span>평균 결제액</span></article>
      </div>

      <h3>상품별</h3>
      {metrics.products.length === 0
        ? <p className="admin-empty">아직 결제 완료된 주문이 없습니다.</p>
        : (
          <div className="admin-order-list">
            {metrics.products.map((product) => (
              <div key={product.productCode}>
                <span>{PRODUCT_LABEL[product.productCode] ?? product.productCode}</span>
                <span>{product.paidCount}건</span>
                <strong>{won(product.revenue)}</strong>
              </div>
            ))}
          </div>
        )}

      <h3>날짜별</h3>
      <div className="admin-daybars">
        {metrics.daily.map((day) => (
          <div className="admin-daybar" key={day.date}>
            <div
              aria-hidden="true"
              className="admin-daybar-track"
              title={`${day.date} · 주문 ${day.started}건 · 결제 ${day.paid}건`}
            >
              <span
                className="admin-daybar-started"
                style={{ height: `${Math.round((day.started / busiest) * 100)}%` }}
              />
              <span
                className="admin-daybar-paid"
                style={{ height: `${Math.round((day.paid / busiest) * 100)}%` }}
              />
            </div>
            <small>{day.date.slice(5).replace("-", "/")}</small>
            <span className="visually-hidden">
              {day.date} 주문 {day.started}건, 결제 {day.paid}건, {won(day.revenue)}
            </span>
          </div>
        ))}
      </div>
      <p className="admin-daybar-legend">
        <span className="admin-daybar-key is-started" /> 주문 시작
        <span className="admin-daybar-key is-paid" /> 결제 완료
      </p>

      <p className="plans-notice">
        위 숫자는 실제 주문 기록에서 계산합니다. 방문자 수와 유입 경로는 이 사이트에
        추적 코드를 넣지 않아 여기서 볼 수 없고, Cloudflare 대시보드에서 확인하실 수
        있습니다.
      </p>
    </section>
  );
}
