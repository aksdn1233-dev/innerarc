"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";

const eventTypes = [
  ["relationship", "연애", "Relationship", "恋愛"],
  ["breakup", "이별", "Breakup", "別れ"],
  ["reunion", "재회", "Reunion", "復縁"],
  ["job_change", "이직", "Job change", "転職"],
  ["employment", "취업", "Employment", "就職"],
  ["business", "사업", "Business", "事業"],
  ["large_purchase", "큰 소비", "Large purchase", "大きな買い物"],
  ["investment_result", "투자 손익", "Investment result", "投資の結果"],
  ["family_conflict", "가족 갈등", "Family conflict", "家族との葛藤"],
  ["social_relationship", "인간관계", "Social relationship", "人間関係"],
  ["health_lifestyle_change", "건강 관련 생활 변화", "Health-related lifestyle change", "健康に関する生活の変化"],
  ["important_decision", "중요한 의사결정", "Important decision", "大切な決断"],
  ["exam_result", "시험·합격", "Exam result", "試験・合否"],
  ["move", "이사", "Move", "引っ越し"],
  ["financial_change", "재정 변화", "Financial change", "お金の変化"],
  ["other", "기타", "Other", "その他"],
] as const;

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function EvidenceEventCapture(props: {
  locale: Locale | "ja";
  orderId: string;
  signedIn: boolean;
  sections: readonly { index: number; title: string }[];
}) {
  const ko = props.locale === "ko";
  const ja = props.locale === "ja";
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
      <p className="eyebrow">{ko ? "실제 삶의 근거" : ja ? "実際の記録" : "Lived evidence"}</p>
      <h2>{ko ? "방금 떠오른 일을 짧게 기록해 보세요" : ja ? "思い浮かんだ出来事を短く記録しましょう" : "Record a real-life event in a few words"}</h2>
      <p>{ko ? "의료 정보를 운세 예측으로 다루지 않습니다. 건강 항목은 생활 변화 기록에만 사용됩니다." : ja ? "医療情報を占いの予測として扱いません。健康項目は生活の変化を記録するためだけに使います。" : "Medical information is not treated as fortune prediction. Health entries are limited to lifestyle changes."}</p>
      <form action={(formData) => void submit(formData)}>
        <label><span>{ko ? "무슨 일이 있었나요?" : ja ? "どんなことがありましたか？" : "What happened?"}</span><select name="eventType" required>{eventTypes.map(([value, koLabel, enLabel, jaLabel]) => <option key={value} value={value}>{ko ? koLabel : ja ? jaLabel : enLabel}</option>)}</select></label>
        <label><span>{ko ? "영역" : ja ? "分野" : "Domain"}</span><select name="lifeDomain" required><option value="relationship">{ko ? "관계" : ja ? "人間関係" : "Relationship"}</option><option value="work">{ko ? "일" : ja ? "仕事" : "Work"}</option><option value="money">{ko ? "돈" : ja ? "お金" : "Money"}</option><option value="family">{ko ? "가족" : ja ? "家族" : "Family"}</option><option value="health_lifestyle">{ko ? "건강 관련 생활" : ja ? "健康に関する生活" : "Health-related lifestyle"}</option><option value="decision">{ko ? "의사결정" : ja ? "意思決定" : "Decision"}</option><option value="education">{ko ? "시험·학업" : ja ? "試験・学業" : "Education"}</option><option value="move">{ko ? "이사" : ja ? "引っ越し" : "Move"}</option><option value="growth">{ko ? "성장" : ja ? "成長" : "Growth"}</option><option value="other">{ko ? "기타" : ja ? "その他" : "Other"}</option></select></label>
        <label><span>{ko ? "언제" : ja ? "いつ" : "When"}</span><input defaultValue={today()} name="eventDate" required type="date" /></label>
        <label className="evidence-approximate"><input name="approximateDate" type="checkbox" /> <span>{ko ? "대략적인 날짜" : ja ? "おおよその日付" : "Approximate date"}</span></label>
        <label className="evidence-description"><span>{ko ? "짧은 설명" : ja ? "短い説明" : "Short description"}</span><input maxLength={500} name="shortDescription" required /></label>
        <label><span>{ko ? "결과" : ja ? "結果" : "Outcome"}</span><select name="outcome"><option value="unresolved">{ko ? "아직 모름" : ja ? "まだ分からない" : "Unresolved"}</option><option value="positive">{ko ? "긍정" : ja ? "良かった" : "Positive"}</option><option value="negative">{ko ? "부정" : ja ? "良くなかった" : "Negative"}</option><option value="mixed">{ko ? "혼합" : ja ? "両方" : "Mixed"}</option><option value="neutral">{ko ? "중립" : ja ? "どちらでもない" : "Neutral"}</option></select></label>
        <label><span>{ko ? "연결할 해석 (선택)" : ja ? "関連づける解釈（任意）" : "Link an interpretation (optional)"}</span><select name="sectionIndex"><option value="">{ko ? "연결하지 않음" : ja ? "関連づけない" : "No link"}</option>{props.sections.map((section) => <option key={section.index} value={section.index}>{section.title}</option>)}</select></label>
        <label><span>{ko ? "그 해석과의 관계" : ja ? "その解釈との関係" : "Relation to the interpretation"}</span><select name="relation"><option value="SUPPORT">{ko ? "뒷받침해요" : ja ? "当てはまる" : "Supports"}</option><option value="CONTRADICT">{ko ? "반대돼요" : ja ? "当てはまらない" : "Contradicts"}</option><option value="AMBIGUOUS">{ko ? "애매해요" : ja ? "まだ分からない" : "Ambiguous"}</option></select></label>
        <button className="primary-button" disabled={status === "saving"} type="submit">{status === "saving" ? (ko ? "저장 중…" : ja ? "保存中…" : "Saving…") : (ko ? "사건 기록하기" : ja ? "出来事を記録" : "Save event")}</button>
        <p aria-live="polite">{status === "saved" ? (ko ? "내 패턴 근거에 기록했어요." : ja ? "パターンの記録に保存しました。" : "Saved to your pattern evidence.") : status === "error" ? (ko ? "지금은 저장할 수 없어요." : ja ? "現在は保存できません。" : "This could not be saved.") : ""}</p>
      </form>
    </section>
  );
}
