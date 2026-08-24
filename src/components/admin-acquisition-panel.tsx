import {
  acquisitionSourceLabels,
  type AcquisitionSource,
} from "@/core/acquisition-survey";
import type { StoredAcquisitionSurvey } from "@/server/acquisition-surveys";

export function AdminAcquisitionPanel({
  available,
  summary,
  recent,
}: {
  available: boolean;
  summary: readonly Readonly<{ source: AcquisitionSource; count: number }>[];
  recent: readonly StoredAcquisitionSurvey[];
}) {
  const total = summary.reduce((sum, item) => sum + item.count, 0);
  return (
    <section className="admin-orders admin-acquisition">
      <div className="admin-section-heading">
        <div>
          <p className="eyebrow">ACQUISITION VOICE</p>
          <h2>고객 유입경로 설문</h2>
        </div>
        <strong>{available ? `${total}건` : "연결 필요"}</strong>
      </div>
      {!available ? (
        <p className="plans-notice">설문 데이터베이스 마이그레이션을 적용하면 집계가 표시됩니다.</p>
      ) : total === 0 ? (
        <p className="empty-state">아직 제출된 유입경로 설문이 없습니다.</p>
      ) : (
        <>
          <div className="admin-acquisition-bars">
            {summary.map((item) => {
              const percentage = Math.round((item.count / total) * 100);
              return (
                <div key={item.source}>
                  <span>{acquisitionSourceLabels.ko[item.source]}</span>
                  <div aria-label={`${percentage}%`}><i style={{ width: `${percentage}%` }} /></div>
                  <strong>{item.count} · {percentage}%</strong>
                </div>
              );
            })}
          </div>
          <details className="admin-acquisition-recent">
            <summary>최근 응답 보기</summary>
            <div className="admin-order-list">
              {recent.slice(0, 20).map((item) => (
                <div key={item.id}>
                  <code>{item.order_id}</code>
                  <strong>{acquisitionSourceLabels.ko[item.source]}</strong>
                  <span>{item.detail || "—"}</span>
                  <time>{new Date(item.created_at).toLocaleDateString("ko-KR")}</time>
                </div>
              ))}
            </div>
          </details>
        </>
      )}
    </section>
  );
}
