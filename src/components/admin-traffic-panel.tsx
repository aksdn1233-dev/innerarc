import type { OperationalMetrics } from "@/server/operational-metrics";

export function AdminTrafficPanel({
  metrics,
  days,
  available,
}: {
  metrics: OperationalMetrics;
  days: number;
  available: boolean;
}) {
  const peak = Math.max(1, ...metrics.daily.map((day) => day.pageViews));

  return (
    <section className="admin-metrics">
      <h2>페이지·전환 흐름</h2>
      {!available && (
        <p className="admin-warning">운영 데이터 저장소를 준비하지 못했습니다. 주문·결제 통계는 계속 정상 작동합니다.</p>
      )}
      <div className="admin-stat-grid">
        <article><strong>{metrics.pageViews}</strong><span>페이지 조회</span></article>
        <article><strong>{metrics.ctaClicks}</strong><span>주요 버튼 클릭</span></article>
        <article><strong>{metrics.formStarts}</strong><span>입력 시작</span></article>
        <article><strong>{metrics.formCompletes}</strong><span>입력 완료</span></article>
        <article><strong>{metrics.paymentStarts}</strong><span>결제 시작</span></article>
        <article><strong>{metrics.paymentSuccesses}</strong><span>결제 성공</span></article>
        <article><strong>{metrics.formCompletionRate}%</strong><span>입력 완료율</span></article>
        <article><strong>{metrics.checkoutCompletionRate}%</strong><span>결제 완료율</span></article>
      </div>
      <h3>최근 {days}일 조회 흐름</h3>
      <div className="admin-daybars">
        {metrics.daily.map((day) => (
          <div className="admin-daybar" key={day.date}>
            <div className="admin-daybar-track" title={`${day.date} · 조회 ${day.pageViews} · 입력 ${day.formStarts} · 결제 ${day.payments}`}>
              <span className="admin-daybar-started" style={{ height: `${Math.round((day.pageViews / peak) * 100)}%` }} />
              <span className="admin-daybar-paid" style={{ height: `${Math.round((day.payments / peak) * 100)}%` }} />
            </div>
            <small>{day.date.slice(5).replace("-", "/")}</small>
          </div>
        ))}
      </div>
      <p className="plans-notice">
        이름·생년월일·질문·휴대폰·IP 주소는 저장하지 않습니다. 날짜·언어·버튼 종류별 합계만 보관하므로
        방문자 개인을 추적하거나 고유 방문자 수를 계산하지 않습니다.
      </p>
    </section>
  );
}
