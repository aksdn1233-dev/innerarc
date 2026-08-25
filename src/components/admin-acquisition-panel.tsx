import {
  FOLLOW_UP_INTERESTS,
  PREFERRED_CADENCES,
  RETURN_INTENTS,
  acquisitionSourceLabels,
  followUpInterestLabels,
  preferredCadenceLabels,
  returnIntentLabels,
  satisfactionLabels,
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
  const complete = recent.filter((item) => item.satisfactionScore !== null && item.returnIntent !== null && item.desiredFollowUp !== null && item.preferredCadence !== null);
  const average = complete.length > 0
    ? complete.reduce((sum, item) => sum + (item.satisfactionScore ?? 0), 0) / complete.length
    : null;
  const likely = complete.filter((item) => item.returnIntent === "very_likely" || item.returnIntent === "likely").length;
  const likelyRate = complete.length > 0 ? Math.round((likely / complete.length) * 100) : null;

  const countsFor = <T extends string>(values: readonly T[], pick: (row: StoredAcquisitionSurvey) => T | null) =>
    values
      .map((value) => ({ value, count: complete.filter((row) => pick(row) === value).length }))
      .filter((item) => item.count > 0)
      .sort((left, right) => right.count - left.count);
  const returnCounts = countsFor(RETURN_INTENTS, (row) => row.returnIntent);
  const followUpCounts = countsFor(FOLLOW_UP_INTERESTS, (row) => row.desiredFollowUp);
  const cadenceCounts = countsFor(PREFERRED_CADENCES, (row) => row.preferredCadence);

  return (
    <section className="admin-orders admin-acquisition">
      <div className="admin-section-heading">
        <div>
          <p className="eyebrow">ACQUISITION VOICE</p>
          <h2>고객 유입·유지 설문</h2>
        </div>
        <strong>{available ? `${total}건` : "연결 필요"}</strong>
      </div>
      {!available ? (
        <p className="plans-notice">설문 저장소가 연결되면 집계가 표시됩니다.</p>
      ) : total === 0 ? (
        <p className="empty-state">아직 제출된 유입경로 설문이 없습니다.</p>
      ) : (
        <>
          <div className="admin-acquisition-kpis">
            <article>
              <span>확장 설문 응답</span>
              <strong>{complete.length}건</strong>
              <small>기존 유입경로 응답은 그대로 유지됩니다.</small>
            </article>
            <article>
              <span>평균 도움 정도</span>
              <strong>{average === null ? "—" : `${average.toFixed(1)} / 5`}</strong>
              <small>{average === null ? "응답 대기 중" : satisfactionLabels.ko[Math.round(average) as 1 | 2 | 3 | 4 | 5]}</small>
            </article>
            <article>
              <span>재이용 긍정 의향</span>
              <strong>{likelyRate === null ? "—" : `${likelyRate}%`}</strong>
              <small>‘꼭 다시’와 ‘다시 이용할 것 같음’의 합계</small>
            </article>
          </div>

          {complete.length > 0 && (
            <div className="admin-acquisition-breakdowns">
              <section>
                <h3>재이용 의향</h3>
                {returnCounts.map((item) => <p key={item.value}><span>{returnIntentLabels.ko[item.value]}</span><strong>{item.count}</strong></p>)}
              </section>
              <section>
                <h3>다음에 원하는 경험</h3>
                {followUpCounts.map((item) => <p key={item.value}><span>{followUpInterestLabels.ko[item.value]}</span><strong>{item.count}</strong></p>)}
              </section>
              <section>
                <h3>부담 없는 이용 간격</h3>
                {cadenceCounts.map((item) => <p key={item.value}><span>{preferredCadenceLabels.ko[item.value]}</span><strong>{item.count}</strong></p>)}
              </section>
            </div>
          )}

          <h3 className="admin-acquisition-subtitle">처음 알게 된 경로</h3>
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
            <summary>최근 설문 응답 보기</summary>
            <div className="admin-order-list">
              {recent.slice(0, 20).map((item) => (
                <div key={item.id}>
                  <code>{item.order_id}</code>
                  <strong>{acquisitionSourceLabels.ko[item.source]}</strong>
                  <span>{item.detail || "—"}</span>
                  <span>{item.satisfactionScore ? `${item.satisfactionScore}점 · ${satisfactionLabels.ko[item.satisfactionScore]}` : "기존 유입경로 응답"}</span>
                  {item.returnIntent && <span>{returnIntentLabels.ko[item.returnIntent]}</span>}
                  {item.desiredFollowUp && <span>{followUpInterestLabels.ko[item.desiredFollowUp]}</span>}
                  {item.preferredCadence && <span>{preferredCadenceLabels.ko[item.preferredCadence]}</span>}
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
