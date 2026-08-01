"use client";

import type { PaymentSetupCheck, PaymentSetupReport } from "@/server/payments/diagnostics";
import type { PaymentSetupEvent } from "@/server/payments/gate";

const STATUS_MARK: Readonly<Record<PaymentSetupCheck["status"], string>> = {
  ok: "정상",
  missing: "필요",
  invalid: "오류",
  info: "안내",
};

const STAGE_LABEL: Readonly<Record<string, string>> = {
  provider_request: "결제 요청",
  provider_cancel: "결제 취소",
  callback: "결제 결과 수신",
};

function formatTime(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("ko-KR");
}

/**
 * Shows payment readiness reasons one by one.
 * It intentionally does not include a separate launch approval action now.
 */
export function AdminPaymentReadinessPanel({
  report,
  recentFailures,
}: {
  report: PaymentSetupReport;
  recentFailures: readonly PaymentSetupEvent[];
}) {
  const blocking = report.checks.filter(
    (check) => check.status === "missing" || check.status === "invalid",
  );

  return (
    <section className="admin-settings-card admin-readiness-card">
      <h2>결제 개시 상태</h2>
      <p className={report.open ? "readiness-summary is-open" : "readiness-summary is-closed"}>
        <strong>{report.open ? "열림" : "닫힘"}</strong> {report.summary}
      </p>

      {blocking.length > 0 && (
        <p className="readiness-blocking">
          지금은 아래 조건 {blocking.length}개가 결제를 막고 있습니다: {blocking.map((check) => check.title).join(", ")}
        </p>
      )}

      <ol className="readiness-list">
        {report.checks.map((check) => (
          <li className={`readiness-item is-${check.status}`} key={check.id}>
            <p className="readiness-item-head">
              <span className="readiness-badge">{STATUS_MARK[check.status]}</span>
              <strong>{check.title}</strong>
            </p>
            <p className="readiness-detail">{check.detail}</p>
            {check.remedy && <p className="readiness-remedy">해결 방법: {check.remedy}</p>}
            {check.variables.length > 0 && (
              <p className="readiness-variables">
                {check.variables.map((name) => <code key={name}>{name}</code>)}
              </p>
            )}
          </li>
        ))}
      </ol>

      {report.provider === "payapp" && report.callbackUrls.payAppFeedback && (
        <div className="readiness-callbacks">
          <h3>페이앱에 등록할 주소</h3>
          <p>
            결제가 끝났다는 결과를 사이트가 받는 주소입니다. 이 값이 잘못되면 결제 후
            리포트가 열리지 않습니다.
          </p>
          <dl>
            <div><dt>결제 결과 주소</dt><dd><code>{report.callbackUrls.payAppFeedback}</code></dd></div>
            <div><dt>결제 후 돌아올 주소</dt><dd><code>{report.callbackUrls.payAppReturn}</code></dd></div>
          </dl>
        </div>
      )}

      <div className="readiness-failures">
        <h3>최근 결제 실패 기록</h3>
        {recentFailures.length === 0 ? (
          <p className="readiness-detail">최근 결제 연동 실패 이벤트가 없습니다.</p>
        ) : (
          <ul>
            {recentFailures.map((event) => (
              <li key={event.id}>
                <span>{formatTime(event.created_at)}</span>
                <strong>{STAGE_LABEL[event.stage] ?? event.stage} · {event.code}</strong>
                <span>{event.message}</span>
                {event.order_id && <code>{event.order_id}</code>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
