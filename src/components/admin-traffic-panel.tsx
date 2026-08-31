import type { OperationalMetrics } from "@/server/operational-metrics";

const ROUTE_LABELS: Readonly<Record<string, string>> = {
  home: "홈",
  fortune: "사주 안내",
  saju: "사주 입력",
  numerology: "무료 패턴",
  reading: "리딩 상품",
  plans: "결제 상품",
  events: "이벤트",
  sample_saju: "사주 예시",
  report: "결과 리포트",
  shop: "상점",
  other: "기타",
};

const SOURCE_LABELS: Readonly<Record<string, string>> = {
  direct: "직접 방문",
  naver_blog: "네이버 블로그",
  naver_search: "네이버 검색",
  google_search: "구글 검색",
  instagram: "인스타그램",
  disquiet: "디스콰이엇",
  seenthis: "씬디스",
  other_campaign: "기타 캠페인",
  other_referral: "기타 외부 링크",
};

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
      <div className="admin-traffic-breakdowns">
        <section>
          <h3>화면별 진입</h3>
          {metrics.routeViews.length === 0 ? (
            <p className="admin-empty">새 집계가 시작된 뒤 화면별 수치가 표시됩니다.</p>
          ) : (
            <div className="admin-order-list">
              {metrics.routeViews.map((entry) => (
                <div key={entry.key}>
                  <span>{ROUTE_LABELS[entry.key] ?? entry.key}</span>
                  <strong>{entry.count}회</strong>
                </div>
              ))}
            </div>
          )}
        </section>
        <section>
          <h3>유입 경로</h3>
          {metrics.sourceViews.length === 0 ? (
            <p className="admin-empty">새 집계가 시작된 뒤 유입 경로가 표시됩니다.</p>
          ) : (
            <div className="admin-order-list">
              {metrics.sourceViews.map((entry) => (
                <div key={entry.key}>
                  <span>{SOURCE_LABELS[entry.key] ?? entry.key}</span>
                  <strong>{entry.count}회</strong>
                </div>
              ))}
            </div>
          )}
        </section>
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
        이름·생년월일·질문·휴대폰·IP 주소와 원문 주소는 저장하지 않습니다. 화면·허용된 유입 분류·버튼
        종류별 합계만 보관하며, 알려진 자동 점검과 내부 관리자 화면은 제외합니다. 숫자는 사람이 아니라
        집계된 화면 진입 횟수이므로 고유 방문자 수로 해석하지 않습니다.
      </p>
    </section>
  );
}
