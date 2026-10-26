import { useId, type CSSProperties } from "react";
import type { FreeConcernReading } from "@/core/free-concern-reading";
import type { Locale } from "@/i18n/config";
import { CRISIS_RESOURCES, getCrisisResourceCopy } from "@/core/ai/crisis-resources";
// This result appears only after local input. Keep its small style set with the
// component instead of adding another globally/preloaded stylesheet to Saju.
const styles = {
  reading: { margin: "0 0 1.5rem", padding: "clamp(1.1rem, 3vw, 1.8rem)", border: "1px solid #d9cec0", borderRadius: 12, background: "#fffdf8", color: "#292622", textAlign: "left", overflowWrap: "anywhere", wordBreak: "keep-all" },
  kicker: { margin: "0 0 .6rem", color: "#7b3b3b", fontSize: ".82rem", fontWeight: 700 },
  heading: { margin: "0 0 1rem", fontSize: "clamp(1.25rem, 3.6vw, 1.7rem)", lineHeight: 1.45, color: "#292622" },
  quote: { margin: "0 0 1rem", padding: ".7rem .9rem", borderLeft: "3px solid #9d7260", background: "#f4efe6", fontSize: ".92rem" },
  answer: { margin: "0 0 1.2rem", fontSize: "1rem", lineHeight: 1.8, whiteSpace: "pre-line" },
  list: { display: "grid", gap: ".85rem", margin: 0 },
  row: { display: "grid", gap: ".3rem" },
  term: { fontSize: ".85rem", fontWeight: 700, color: "#7b3b3b" },
  detail: { margin: 0, fontSize: ".95rem", lineHeight: 1.75, whiteSpace: "pre-line" },
  note: { margin: "1rem 0 0", fontSize: ".8rem", lineHeight: 1.65, color: "#665c50" },
  support: { marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #d9cec0", fontSize: ".9rem", lineHeight: 1.75 },
  supportHeading: { margin: "0 0 .5rem", fontSize: "1rem" },
  supportList: { paddingLeft: "1rem" },
  supportLink: { color: "#703333", textDecoration: "underline", textUnderlineOffset: ".18em" },
} satisfies Record<string, CSSProperties>;

export function FreeConcernReadingCard({ reading, locale }: { reading: FreeConcernReading; locale: Locale }) {
  const id = useId();
  const ko = locale === "ko";
  return (
    <section aria-labelledby={id} style={styles.reading} data-testid="free-concern-reading" data-topic={reading.topicId} role={reading.scope === "safety" ? "alert" : undefined}>
      <p style={styles.kicker}>{reading.label} · {ko ? "지금 고민부터 볼게요" : "Your concern comes first"}</p>
      {reading.focusId !== reading.selectedFocusId && <p style={styles.note}>{ko ? `선택한 분야는 ${reading.selectedLabel}지만, 적어주신 질문에 맞춰 먼저 살펴볼게요.` : `You selected ${reading.selectedLabel}; this guidance starts with the question you wrote.`}</p>}
      <h2 id={id} style={styles.heading}>{reading.title}</h2>
      {reading.question && <blockquote style={styles.quote} aria-label={ko ? "내가 적은 질문" : "Your question"}>{reading.question}</blockquote>}
      <p style={styles.answer}>{reading.answer}</p>
      <dl style={styles.list}>
        <div style={styles.row}><dt style={styles.term}>{ko ? "확인할 것" : "What to check"}</dt><dd style={styles.detail}>{reading.information}</dd></div>
        <div style={styles.row}><dt style={styles.term}>{ko ? "지금 해볼 일" : "Try this now"}</dt><dd style={styles.detail}>{reading.action}</dd></div>
        <div style={styles.row}><dt style={styles.term}>{ko ? "다시 볼 기준" : "When to reconsider"}</dt><dd style={styles.detail}>{reading.reconsider}</dd></div>
      </dl>
      {reading.additionalTopics.length > 0 && <p style={styles.note}>{ko ? `이번 첫 안내에서는 앞의 두 주제부터 살펴봤어요. ${reading.additionalTopics.join(" · ")} 고민은 한 가지씩 구체적으로 적어주세요.` : `This first guidance covers the first two topics. Please ask about ${reading.additionalTopics.join(" / ")} separately with more context.`}</p>}
      {reading.urgentSupport && <aside style={styles.support}>
        <h3 style={styles.supportHeading}>{getCrisisResourceCopy(locale).title}</h3>
        <p>{getCrisisResourceCopy(locale).emergency}</p>
        <p>{getCrisisResourceCopy(locale).locationCaution}</p>
        <ul style={styles.supportList}>{CRISIS_RESOURCES.map(resource => <li key={resource.regionCode}>
          <span>{resource.regionCode} · {resource.service[locale]} </span>
          <a style={styles.supportLink} href={resource.contactHref}>{resource.contactLabel[locale]}</a>{" · "}
          <a style={styles.supportLink} href={resource.officialUrl} rel="noreferrer" target="_blank">{getCrisisResourceCopy(locale).officialSource}</a>
        </li>)}</ul>
      </aside>}
      {reading.scope !== "safety" && <p style={styles.note}>{ko ? "원국과 성향 풀이도 이 고민에 비춰 살펴보세요. 해석과 다르게 느낀 경험도 중요해요." : "Read the chart and pattern reflection alongside this concern. Experiences that differ from the interpretation matter too."}</p>}
    </section>
  );
}
