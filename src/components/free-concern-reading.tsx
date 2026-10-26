import { useId } from "react";
import type { FreeConcernReading } from "@/core/free-concern-reading";
import type { Locale } from "@/i18n/config";
import { CRISIS_RESOURCES, getCrisisResourceCopy } from "@/core/ai/crisis-resources";
import styles from "./free-concern-reading.module.css";

export function FreeConcernReadingCard({ reading, locale }: { reading: FreeConcernReading; locale: Locale }) {
  const id = useId();
  const ko = locale === "ko";
  return (
    <section aria-labelledby={id} className={styles.reading} data-testid="free-concern-reading" data-topic={reading.topicId} role={reading.scope === "safety" ? "alert" : undefined}>
      <p className={styles.kicker}>{reading.label} · {ko ? "지금 고민부터 볼게요" : "Your concern comes first"}</p>
      {reading.focusId !== reading.selectedFocusId && <p className={styles.note}>{ko ? `선택한 분야는 ${reading.selectedLabel}지만, 적어주신 질문에 맞춰 먼저 살펴볼게요.` : `You selected ${reading.selectedLabel}; this guidance starts with the question you wrote.`}</p>}
      <h2 id={id}>{reading.title}</h2>
      {reading.question && <blockquote aria-label={ko ? "내가 적은 질문" : "Your question"}>{reading.question}</blockquote>}
      <p className={styles.answer}>{reading.answer}</p>
      <dl>
        <div><dt>{ko ? "확인할 것" : "What to check"}</dt><dd>{reading.information}</dd></div>
        <div><dt>{ko ? "지금 해볼 일" : "Try this now"}</dt><dd>{reading.action}</dd></div>
        <div><dt>{ko ? "다시 볼 기준" : "When to reconsider"}</dt><dd>{reading.reconsider}</dd></div>
      </dl>
      {reading.additionalTopics.length > 0 && <p className={styles.note}>{ko ? `이번 첫 안내에서는 앞의 두 주제부터 살펴봤어요. ${reading.additionalTopics.join(" · ")} 고민은 한 가지씩 구체적으로 적어주세요.` : `This first guidance covers the first two topics. Please ask about ${reading.additionalTopics.join(" / ")} separately with more context.`}</p>}
      {reading.urgentSupport && <aside className={styles.support}>
        <h3>{getCrisisResourceCopy(locale).title}</h3>
        <p>{getCrisisResourceCopy(locale).emergency}</p>
        <p>{getCrisisResourceCopy(locale).locationCaution}</p>
        <ul>{CRISIS_RESOURCES.map(resource => <li key={resource.regionCode}>
          <span>{resource.regionCode} · {resource.service[locale]} </span>
          <a href={resource.contactHref}>{resource.contactLabel[locale]}</a>{" · "}
          <a href={resource.officialUrl} rel="noreferrer" target="_blank">{getCrisisResourceCopy(locale).officialSource}</a>
        </li>)}</ul>
      </aside>}
      {reading.scope !== "safety" && <p className={styles.note}>{ko ? "원국과 성향 풀이도 이 고민에 비춰 살펴보세요. 해석과 다르게 느낀 경험도 중요해요." : "Read the chart and pattern reflection alongside this concern. Experiences that differ from the interpretation matter too."}</p>}
    </section>
  );
}
