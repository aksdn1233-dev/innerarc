"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";

const eventTypes = [
  ["relationship", "연애", "Relationship"],
  ["breakup", "이별", "Breakup"],
  ["reunion", "재회", "Reunion"],
  ["job_change", "이직", "Job change"],
  ["employment", "취업", "Employment"],
  ["business", "사업", "Business"],
  ["large_purchase", "큰 소비", "Large purchase"],
  ["investment_result", "투자 손익", "Investment result"],
  ["family_conflict", "가족 갈등", "Family conflict"],
  ["social_relationship", "인간관계", "Social relationship"],
  ["health_lifestyle_change", "건강 관련 생활 변화", "Health-related lifestyle change"],
  ["important_decision", "중요한 의사결정", "Important decision"],
  ["exam_result", "시험·합격", "Exam result"],
  ["move", "이사", "Move"],
  ["financial_change", "재정 변화", "Financial change"],
  ["other", "기타", "Other"],
] as const;

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function EvidenceEventCapture(props: {
  locale: Locale;
  orderId: string;
  signedIn: boolean;
  sections: readonly { index: number; title: string }[];
}) {
  const ko = props.locale === "ko";
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(formData: FormData) {
    setStatus("saving");
    const linkedIndex = String(formData.get("sectionIndex") ?? "");
    const payload: Record<string, unknown> = {
      eventType: formData.get("eventType"),
      lifeDomain: formData.get("lifeDomain"),
      eventDate: formData.get("eventDate"),
      approximateDate: formData.get("approximateDate") === "on",
      shortDescription: formData.get("shortDescription"),
      outcome: formData.get("outcome"),
      relationshipContext: "",
      clientRequestId: `event:${crypto.randomUUID()}`,
    };
    if (linkedIndex) {
      payload.orderId = props.orderId;
      payload.sectionIndex = Number(linkedIndex);
      payload.relation = formData.get("relation");
    }
    try {
      const response = await fetch("/api/patterns/evidence-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("SAVE_FAILED");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  if (!props.signedIn) return null;
  return (
    <section className="evidence-event-capture">
      <p className="eyebrow">{ko ? "실제 삶의 근거" : "Lived evidence"}</p>
      <h2>{ko ? "방금 떠오른 일을 짧게 기록해 보세요" : "Record a real-life event in a few words"}</h2>
      <p>{ko ? "의료 정보를 운세 예측으로 다루지 않습니다. 건강 항목은 생활 변화 기록에만 사용됩니다." : "Medical information is not treated as fortune prediction. Health entries are limited to lifestyle changes."}</p>
      <form action={(formData) => void submit(formData)}>
        <label><span>{ko ? "무슨 일이 있었나요?" : "What happened?"}</span><select name="eventType" required>{eventTypes.map(([value, koLabel, enLabel]) => <option key={value} value={value}>{ko ? koLabel : enLabel}</option>)}</select></label>
        <label><span>{ko ? "영역" : "Domain"}</span><select name="lifeDomain" required><option value="relationship">{ko ? "관계" : "Relationship"}</option><option value="work">{ko ? "일" : "Work"}</option><option value="money">{ko ? "돈" : "Money"}</option><option value="family">{ko ? "가족" : "Family"}</option><option value="health_lifestyle">{ko ? "건강 관련 생활" : "Health-related lifestyle"}</option><option value="decision">{ko ? "의사결정" : "Decision"}</option><option value="education">{ko ? "시험·학업" : "Education"}</option><option value="move">{ko ? "이사" : "Move"}</option><option value="growth">{ko ? "성장" : "Growth"}</option><option value="other">{ko ? "기타" : "Other"}</option></select></label>
        <label><span>{ko ? "언제" : "When"}</span><input defaultValue={today()} name="eventDate" required type="date" /></label>
        <label className="evidence-approximate"><input name="approximateDate" type="checkbox" /> <span>{ko ? "대략적인 날짜" : "Approximate date"}</span></label>
        <label className="evidence-description"><span>{ko ? "짧은 설명" : "Short description"}</span><input maxLength={500} name="shortDescription" required /></label>
        <label><span>{ko ? "결과" : "Outcome"}</span><select name="outcome"><option value="unresolved">{ko ? "아직 모름" : "Unresolved"}</option><option value="positive">{ko ? "긍정" : "Positive"}</option><option value="negative">{ko ? "부정" : "Negative"}</option><option value="mixed">{ko ? "혼합" : "Mixed"}</option><option value="neutral">{ko ? "중립" : "Neutral"}</option></select></label>
        <label><span>{ko ? "연결할 해석 (선택)" : "Link an interpretation (optional)"}</span><select name="sectionIndex"><option value="">{ko ? "연결하지 않음" : "No link"}</option>{props.sections.map((section) => <option key={section.index} value={section.index}>{section.title}</option>)}</select></label>
        <label><span>{ko ? "그 해석과의 관계" : "Relation to the interpretation"}</span><select name="relation"><option value="SUPPORT">{ko ? "뒷받침해요" : "Supports"}</option><option value="CONTRADICT">{ko ? "반대돼요" : "Contradicts"}</option><option value="AMBIGUOUS">{ko ? "애매해요" : "Ambiguous"}</option></select></label>
        <button className="primary-button" disabled={status === "saving"} type="submit">{status === "saving" ? (ko ? "저장 중…" : "Saving…") : (ko ? "사건 기록하기" : "Save event")}</button>
        <p aria-live="polite">{status === "saved" ? (ko ? "내 패턴 근거에 기록했어요." : "Saved to your pattern evidence.") : status === "error" ? (ko ? "지금은 저장할 수 없어요." : "This could not be saved.") : ""}</p>
      </form>
    </section>
  );
}
