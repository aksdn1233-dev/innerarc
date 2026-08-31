"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { PatternRealityCheckResponse } from "@/core/pattern-intelligence";

const responses: readonly { value: PatternRealityCheckResponse; ko: string; en: string }[] = [
  { value: "MATCH", ko: "맞아요", en: "Matches" },
  { value: "PARTIAL", ko: "어느 정도 맞아요", en: "Partly" },
  { value: "MISMATCH", ko: "아니에요", en: "Doesn't match" },
  { value: "CONTEXT_DEPENDENT", ko: "상황마다 달라요", en: "Depends on context" },
];

function requestId(prefix: string): string {
  return `${prefix}:${crypto.randomUUID()}`;
}
export function ReportRealityCheck(props: {
  locale: Locale;
  orderId: string;
  sectionIndex: number;
  signedIn: boolean;
  deterministicBasis: string;
  traditionalBasis: string;
  personalized: boolean;
}) {
  const ko = props.locale === "ko";
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<PatternRealityCheckResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [label, setLabel] = useState<string | null>(null);

  async function save(response: PatternRealityCheckResponse) {
    setSelected(response);
    setStatus("saving");
    try {
      const result = await fetch("/api/patterns/reality-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: props.orderId,
          sectionIndex: props.sectionIndex,
          response,
          note,
          clientRequestId: requestId("reality"),
        }),
      });
      const body = await result.json();
      if (!result.ok) throw new Error(body.error ?? "SAVE_FAILED");
      setLabel(body.learning?.confidenceLabel ?? null);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="pattern-feedback" aria-label={ko ? "해석 현실 확인" : "Interpretation reality check"}>
      <details className="pattern-provenance">
        <summary>{ko ? "왜 이렇게 해석했나요?" : "Why was this interpreted this way?"}</summary>
        <dl>
          <div><dt>{ko ? "계산 근거" : "Calculation basis"}</dt><dd>{props.deterministicBasis}</dd></div>
          <div><dt>{ko ? "전통 해석" : "Traditional interpretation"}</dt><dd>{props.traditionalBasis}</dd></div>
          <div><dt>{ko ? "개인 맥락" : "Personal context"}</dt><dd>{props.personalized ? (ko ? "사용자가 입력한 질문을 해석 문맥에만 반영했습니다." : "Your question was used only as interpretation context.") : (ko ? "별도 개인 맥락을 사용하지 않았습니다." : "No separate personal context was used.")}</dd></div>
          <div><dt>{ko ? "검증 상태" : "Validation state"}</dt><dd>{label ?? (ko ? "검증 중" : "Being checked")}</dd></div>
        </dl>
      </details>
      <p><strong>{ko ? "이 내용은 실제 나와 얼마나 비슷했나요?" : "How closely did this match your real experience?"}</strong></p>
      {!props.signedIn ? (
        <p className="pattern-sign-in-note">
          {ko ? "로그인하면 이 응답을 내 패턴 기록에 안전하게 저장할 수 있어요." : "Sign in to save this response to your private pattern record."}{" "}
          <Link href={`/${props.locale}/me`}>{ko ? "로그인" : "Sign in"}</Link>
        </p>
      ) : (
        <>
          <div className="pattern-feedback-actions">
            {responses.map((item) => (
              <button
                aria-pressed={selected === item.value}
                disabled={status === "saving"}
                key={item.value}
                onClick={() => void save(item.value)}
                type="button"
              >
                {ko ? item.ko : item.en}
              </button>
            ))}
          </div>
          <label className="pattern-note">
            <span>{ko ? "짧은 메모 (선택)" : "Short note (optional)"}</span>
            <input maxLength={500} onChange={(event) => setNote(event.target.value)} value={note} />
          </label>
          <p aria-live="polite" className={`pattern-feedback-status ${status}`}>
            {status === "saving" && (ko ? "저장 중…" : "Saving…")}
            {status === "saved" && (ko ? `기록했어요${label ? ` · ${label}` : ""}` : "Saved to your pattern record")}
            {status === "error" && (ko ? "지금은 저장할 수 없어요. 로그인과 저장 설정을 확인해 주세요." : "This could not be saved. Check sign-in and storage setup.")}
          </p>
        </>
      )}
    </section>
  );
}
