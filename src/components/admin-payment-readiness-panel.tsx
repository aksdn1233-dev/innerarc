"use client";

import { useState } from "react";
import type { PaymentSetupCheck, PaymentSetupReport } from "@/server/payments/diagnostics";
import type { OperationsGate, PaymentSetupEvent } from "@/server/payments/gate";

const CONFIRMATION_PHRASE = "판매 개시";

const STATUS_MARK: Readonly<Record<PaymentSetupCheck["status"], string>> = {
  ok: "정상",
  missing: "필요",
  invalid: "오류",
  info: "안내",
};

const STAGE_LABEL: Readonly<Record<string, string>> = {
  provider_request: "결제요청",
  provider_cancel: "결제취소",
  callback: "결제결과 수신",
};

function formatTime(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("ko-KR");
}

/**
 * Turns the single "결제 닫힘" bit into the specific condition that is closing it.
 * Everything here is presence and shape only — the server never sends a credential —
 * so the panel can name the variable to fix without exposing what is in it.
 */
export function AdminPaymentReadinessPanel({
  report,
  gate,
  recentFailures,
}: {
  report: PaymentSetupReport;
  gate: OperationsGate;
  recentFailures: readonly PaymentSetupEvent[];
}) {
  const [approved, setApproved] = useState(gate.launchApprovedByOwner);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const blocking = report.checks.filter(
    (check) => check.status === "missing" || check.status === "invalid",
  );

  async function submitApproval(nextApproved: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/payments/launch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: nextApproved, confirmation }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        detail?: string;
      };
      if (response.ok) {
        setApproved(nextApproved);
        setConfirmation("");
        setMessage(
          nextApproved
            ? "판매 개시를 승인했습니다. 이 화면을 새로고침하면 결제 상태가 갱신됩니다."
            : "판매 개시 승인을 해제했습니다.",
        );
        return;
      }
      if (body.error === "CONFIRMATION_REQUIRED") {
        setMessage(`승인하려면 확인 문구에 "${CONFIRMATION_PHRASE}" 를 정확히 입력하세요.`);
        return;
      }
      if (body.detail === "MIGRATION_REQUIRED") {
        setMessage(
          "승인 값을 저장할 열이 아직 없습니다. supabase/migrations 의 20260731000100_payment_launch_approval.sql 을 적용한 뒤 다시 시도하세요.",
        );
        return;
      }
      setMessage("승인 상태를 저장하지 못했습니다.");
    } catch {
      setMessage("승인 상태를 저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-settings-card admin-readiness-card">
      <h2>결제 열림 상태</h2>
      <p className={report.open ? "readiness-summary is-open" : "readiness-summary is-closed"}>
        <strong>{report.open ? "결제 열림" : "결제 닫힘"}</strong> {report.summary}
      </p>

      {blocking.length > 0 && (
        <p className="readiness-blocking">
          지금 결제를 막고 있는 항목 {blocking.length}개: {blocking.map((check) => check.title).join(", ")}
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
            {check.remedy && <p className="readiness-remedy">→ {check.remedy}</p>}
            {check.variables.length > 0 && (
              <p className="readiness-variables">
                {check.variables.map((name) => <code key={name}>{name}</code>)}
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="readiness-approval">
        <h3>판매 개시 승인</h3>
        <p>
          결제사 연동 값만으로는 결제가 열리지 않습니다. 판매자 정보, 이용조건, 환불·고객지원
          안내, 운영 도메인과 콜백을 확인한 뒤 여기에서 승인하거나 배포 환경에{" "}
          <code>PAYMENTS_LAUNCH_APPROVED=true</code> 를 설정하세요. 두 방법은 효력이 같습니다.
        </p>
        <p className="readiness-detail">
          현재 상태: {report.checks.find((check) => check.id === "launch_approval")?.detail}
          {gate.approvedAt && ` (승인 시각 ${formatTime(gate.approvedAt)})`}
        </p>
        {!gate.migrated && (
          <p className="readiness-remedy">
            → 이 화면에서 승인하려면 <code>20260731000100_payment_launch_approval.sql</code> 마이그레이션을
            먼저 적용해야 합니다. 적용 전까지는 배포 환경변수만 사용할 수 있습니다.
          </p>
        )}
        {!approved ? (
          <>
            <div className="field">
              <label htmlFor="launch-confirmation">확인 문구</label>
              <input
                autoComplete="off"
                id="launch-confirmation"
                maxLength={50}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={CONFIRMATION_PHRASE}
                value={confirmation}
              />
              <small>승인하려면 “{CONFIRMATION_PHRASE}” 를 그대로 입력하세요.</small>
            </div>
            <button
              className="primary-button"
              disabled={busy || confirmation.trim() !== CONFIRMATION_PHRASE}
              onClick={() => void submitApproval(true)}
              type="button"
            >
              판매 개시 승인
            </button>
          </>
        ) : (
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => void submitApproval(false)}
            type="button"
          >
            승인 해제
          </button>
        )}
        {message && <p role="status">{message}</p>}
      </div>

      {report.provider === "payapp" && report.callbackUrls.payAppFeedback && (
        <div className="readiness-callbacks">
          <h3>페이앱에 등록할 주소</h3>
          <p>
            피드백 URL은 결제 승인이 서버에 반영되는 유일한 경로입니다. 이 주소가 공개망에서
            열려 있지 않으면 결제는 되지만 리포트가 열리지 않습니다.
          </p>
          <dl>
            <div><dt>피드백 URL</dt><dd><code>{report.callbackUrls.payAppFeedback}</code></dd></div>
            <div><dt>복귀 URL</dt><dd><code>{report.callbackUrls.payAppReturn}</code></dd></div>
          </dl>
        </div>
      )}

      <div className="readiness-failures">
        <h3>최근 결제사 오류</h3>
        {recentFailures.length === 0 ? (
          <p className="readiness-detail">기록된 결제사 오류가 없습니다.</p>
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
