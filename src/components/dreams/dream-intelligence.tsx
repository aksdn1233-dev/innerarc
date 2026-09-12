"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildDreamSignature,
  clearDreamEvents,
  completeDreamFollowUp,
  createDreamEvent,
  dreamSourcesById,
  exportDreamEvents,
  hydrateAccountDreamEvents,
  loadDreamEvents,
  saveDreamEvents,
  type DreamEvent,
  type DreamInput,
  type DreamInterpretation,
} from "@/core/dreams";
import type { Locale } from "@/i18n/config";
import { captureConversionEvent } from "@/core/analytics";
import styles from "./dream-intelligence.module.css";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Props = Readonly<{ locale: Locale }>;
const today = () => new Date().toISOString().slice(0, 10);
const isDue = (date: string) => date <= today();
const uid = (prefix: string) => `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
const copy = {
  ko: {
    brand: "태령당", nav: "꿈 기록", pattern: "나의 반복", account: "내 기록", eyebrow: "DREAM INTELLIGENCE",
    title: <>꿈을 맞히기보다,<br />내게 반복되는 이유를 봅니다.</>, lead: "꿈속 장면과 감정, 요즘의 현실을 함께 기록해보세요. 나중에 실제로 어땠는지도 다시 확인할 수 있어요.",
    start: "오늘의 꿈 적기", inputTitle: "기억나는 대로 들려주세요.", inputHelp: "문장이 매끄럽지 않아도 괜찮아요. 사람, 장소, 행동, 감정이 담기면 더 잘 비교할 수 있어요.",
    placeholder: "예: 어제 큰 뱀이 집 안으로 들어왔어요. 무섭지는 않았고, 저는 가만히 쳐다봤어요.", concern: "요즘 가장 마음에 걸리는 일", concernPlaceholder: "예: 이직을 앞두고 고민 중이에요. (선택)", recent: "최근 꿈과 닮은 경험", recentPlaceholder: "최근 본 영화, 대화, 사건이 있다면 적어주세요. (선택)", recurring: "비슷한 꿈을 전에 꾼 적이 있어요", lucid: "꿈이라는 걸 알고 있었어요", retain: "꿈 원문을 이 기기에 보관할게요", retainHelp: "선택하지 않으면 분석 결과만 남고, 적은 원문은 저장하지 않습니다.", remoteAI: "외부 문장 구조화를 사용할게요", remoteAIHelp: "선택할 때만 입력한 문장과 위의 선택 정보가 설정된 외부 처리 서비스로 전송됩니다. 꺼두면 기기 안의 기본 분석만 사용합니다.", submit: "꿈 살펴보기",
    report: "오늘의 꿈", summary: "꿈 요약", symbols: "남은 장면", categories: "먼저 살펴본 유형", tradition: "전통에서는", modern: "현대 연구에서는", personal: "지금의 나에게는", systems: "사주·생년월일 패턴과 비교", history: "나의 지난 꿈과 비교", confidence: "근거 상태", questions: "더 정확히 비교하려면", sources: "확인한 출처", safety: "꼭 기억해주세요", revisions: "확인 뒤 달라진 기록", initialLocked: "처음 해석은 그대로 보존되며, 아래 기록만 새로 쌓입니다.", saveNote: "기록은 이 기기에 저장됐어요.", newDream: "다른 꿈 기록하기",
    timeline: "꿈 타임라인", noDreams: "아직 기록한 꿈이 없습니다.", signature: "나의 꿈 패턴", search: "장면·감정 검색", searchPlaceholder: "뱀, 학교, 불안…", export: "내 기록 내려받기", clear: "저장된 꿈 모두 지우기", clearConfirm: "저장된 꿈 기록을 모두 지울까요? 이 작업은 되돌릴 수 없습니다.",
    followup: "Reality Check", followupQuestion: "이 꿈 이후 실제로 기억에 남는 일이 있었나요?", followupSave: "확인 기록 남기기", notDue: "아직 확인할 날이 아니에요.", noEvent: "특별한 일 없음", matched: "연결돼 보임", partial: "일부만 연결", mismatch: "달랐음", context: "상황에 따라 달랐음",
  },
  en: {
    brand: "Taeryeongdang", nav: "Dream journal", pattern: "My patterns", account: "My records", eyebrow: "DREAM INTELLIGENCE",
    title: <>Look for what repeats,<br />rather than trying to predict.</>, lead: "Record the scenes, feelings, and current life around a dream. You can return later to check what actually happened.",
    start: "Record today's dream", inputTitle: "Tell it as you remember it.", inputHelp: "It does not need to be polished. People, places, actions, and feelings make comparison more useful.",
    placeholder: "Example: A large snake came into my house. I wasn't afraid and watched it quietly.", concern: "What is weighing on you lately?", concernPlaceholder: "Example: I am considering a job change. (Optional)", recent: "A recent experience that resembles it", recentPlaceholder: "A recent film, conversation, or event. (Optional)", recurring: "I have had a similar dream before", lucid: "I knew I was dreaming", retain: "Keep the original dream text on this device", retainHelp: "If unchecked, only the analysis is kept; your original words are not stored.", remoteAI: "Use external language structuring", remoteAIHelp: "Only when selected, the dream and choices above are sent to the configured external processing service. If off, the on-device basic analysis is used.", submit: "Explore this dream",
    report: "Today's dream", summary: "Dream summary", symbols: "What stood out", categories: "Types considered first", tradition: "Traditional perspectives", modern: "Modern dream research", personal: "In your current context", systems: "Four Pillars and birth-date patterns", history: "Compared with your dream history", confidence: "Evidence status", questions: "Questions that could improve comparison", sources: "Sources checked", safety: "Please remember", revisions: "What changed after checking", initialLocked: "The first interpretation remains unchanged; later checks are added below.", saveNote: "The record was saved on this device.", newDream: "Record another dream",
    timeline: "Dream timeline", noDreams: "No dreams recorded yet.", signature: "My dream patterns", search: "Search scenes and feelings", searchPlaceholder: "snake, school, anxiety…", export: "Download my records", clear: "Delete all saved dreams", clearConfirm: "Delete all saved dream records? This cannot be undone.",
    followup: "Reality Check", followupQuestion: "Was there anything memorable after this dream?", followupSave: "Save this check", notDue: "This check is not due yet.", noEvent: "Nothing notable", matched: "Seems connected", partial: "Partly connected", mismatch: "Different", context: "Depends on context",
  },
} as const;

const categoryLabels: Record<string, Record<Locale, string>> = {
  DAILY_CONTINUITY: { ko: "최근 일상 반영", en: "Recent life continuity" }, EMOTIONAL_PROCESSING: { ko: "감정 정리", en: "Emotional processing" }, REPEATING_PATTERN: { ko: "반복 꿈", en: "Repeating pattern" }, SYMBOLIC: { ko: "상징이 선명한 꿈", en: "Strong symbolic imagery" }, NIGHTMARE: { ko: "악몽", en: "Nightmare" }, BODY_STATE_RELATED: { ko: "몸 상태 영향 가능", en: "Body-state influence possible" }, TRAUMA_RELATED_POSSIBLE: { ko: "힘든 경험 연관 가능", en: "Trauma relation possible" }, TRADITIONAL_INTERPRETABLE: { ko: "전통 자료 비교 가능", en: "Traditional sources available" }, LUCID_DREAM: { ko: "자각몽", en: "Lucid dream" }, UNKNOWN: { ko: "아직 열어 둔 꿈", en: "Open interpretation" },
};
const confidenceLabels: Record<string, Record<Locale, string>> = { low: { ko: "낮음", en: "Low" }, medium: { ko: "중간", en: "Medium" }, high: { ko: "높음", en: "High" }, none: { ko: "없음", en: "None" }, initial: { ko: "초기", en: "Initial" }, repeated: { ko: "반복", en: "Repeated" }, strong: { ko: "강함", en: "Strong" }, unconfirmed: { ko: "미확인", en: "Unconfirmed" }, partial: { ko: "일부 일치", en: "Partial" }, reference: { ko: "참고 수준", en: "Reference only" }, possible: { ko: "가능성 있는 패턴", en: "Possible pattern" }, strong_personal_pattern: { ko: "강하게 반복되는 개인 패턴", en: "Strong personal pattern" } };

function download(name: string, body: string) { const blob = new Blob([body], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); }
function captureReturnMilestones(records: readonly DreamEvent[], locale: Locale) {
  for (const days of [7, 30] as const) {
    if (!records.some((item) => Date.now() - Date.parse(item.recordedAt) >= days * 86_400_000)) continue;
    const key = `innerarc:dream-return-${days}d:session`;
    try {
      if (window.sessionStorage.getItem(key)) continue;
      window.sessionStorage.setItem(key, "1");
    } catch { /* The aggregate event can still be attempted without browser storage. */ }
    captureConversionEvent(days === 7 ? "dream_return_7d" : "dream_return_30d", locale, {});
  }
}

export function DreamIntelligence({ locale }: Props) {
  const t = copy[locale];
  const [events, setEvents] = useState<DreamEvent[]>([]);
  const [selected, setSelected] = useState<DreamEvent | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [form, setForm] = useState({ dreamDate: today(), rawText: "", currentConcern: "", recentExperience: "", recurring: false, lucid: false, retainRawText: false, allowRemoteAI: false });
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => void (async () => {
      const localEvents = loadDreamEvents(window.localStorage);
      setEvents(localEvents);
      captureReturnMilestones(localEvents, locale);
      const client = getBrowserSupabaseClient();
      if (!client || !(await client.auth.getSession()).data.session?.user) return;
      const response = await fetch("/api/dreams", { headers: { Accept: "application/json" } });
      if (!response.ok || cancelled) return;
      const accountEvents = hydrateAccountDreamEvents(await response.json());
      if (!accountEvents.length || cancelled) return;
      setEvents((current) => {
        const merged = new Map(current.map((item) => [item.id, item]));
        for (const item of accountEvents) {
          const existing = merged.get(item.id);
          if (!existing || Date.parse(item.updatedAt) >= Date.parse(existing.updatedAt)) merged.set(item.id, item);
        }
        const next = [...merged.values()].sort((a, b) => b.dreamDate.localeCompare(a.dreamDate) || b.recordedAt.localeCompare(a.recordedAt)).slice(0, 200);
        saveDreamEvents(window.localStorage, next);
        captureReturnMilestones(next, locale);
        return next;
      });
    })().catch(() => undefined), 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [locale]);
  const signature = useMemo(() => buildDreamSignature(events, locale), [events, locale]);
  const filtered = useMemo(() => { const query = search.trim().toLocaleLowerCase(locale); if (!query) return events; return events.filter((event) => [event.initialInterpretation.title, event.initialInterpretation.normalizedSummary, ...event.initialInterpretation.ontology.flatMap((token) => [token.label.ko, token.label.en])].some((value) => value.toLocaleLowerCase(locale).includes(query))); }, [events, locale, search]);

  function persist(next: DreamEvent[]) { setEvents(next); saveDreamEvents(window.localStorage, next); }
  async function clearAll() {
    if (!window.confirm(t.clearConfirm)) return;
    const client = getBrowserSupabaseClient();
    try {
      if ((await client?.auth.getSession())?.data.session?.user) {
        const response = await fetch("/api/dreams", { method: "DELETE" });
        if (!response.ok) { setError(locale === "ko" ? "계정 기록을 지우지 못했습니다. 잠시 뒤 다시 시도해주세요." : "Account records could not be deleted. Please try again."); return; }
      }
      clearDreamEvents(window.localStorage); setEvents([]); setSelected(null);
    } catch { setError(locale === "ko" ? "기록을 지우지 못했습니다. 잠시 뒤 다시 시도해주세요." : "Records could not be deleted. Please try again."); }
  }
  async function accountInterpretation(input: DreamInput): Promise<{ signedIn: boolean; interpretation: DreamInterpretation | null; mode: "deterministic" | "provider" }> {
    const client = getBrowserSupabaseClient();
    if (!client) return { signedIn: false, interpretation: null, mode: "deterministic" };
    try {
      const auth = await client.auth.getSession();
      if (!auth.data.session?.user) return { signedIn: false, interpretation: null, mode: "deterministic" };
      const response = await fetch("/api/dreams/interpret", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (!response.ok) return { signedIn: true, interpretation: null, mode: "deterministic" };
      const result = await response.json() as { interpretation?: DreamInterpretation; ai?: { used?: boolean } };
      return { signedIn: true, interpretation: result.interpretation ?? null, mode: result.ai?.used ? "provider" : "deterministic" };
    } catch { return { signedIn: false, interpretation: null, mode: "deterministic" }; }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setWorking(true);
    try {
      const recordedAt = new Date().toISOString();
      const input = { requestId: uid("dream_request"), locale, dreamDate: form.dreamDate, rawText: form.rawText, context: { currentConcern: form.currentConcern, recentExperience: form.recentExperience, bodyState: "", recurring: form.recurring, lucid: form.lucid }, retainRawText: form.retainRawText, allowRemoteAI: form.allowRemoteAI } satisfies DreamInput;
      const account = await accountInterpretation(input);
      const created = createDreamEvent(input, { id: crypto.randomUUID(), recordedAt, interpretation: account.interpretation ?? undefined }, events);
      const next = [created, ...events].slice(0, 200); persist(next); setSelected(created);
      if (account.signedIn) void fetch("/api/dreams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: `save_${created.id}`, event: created }) }).catch(() => undefined);
      captureConversionEvent("dream_recorded", locale, { retainedRawText: form.retainRawText });
      captureConversionEvent("dream_interpreted", locale, { mode: account.mode });
      if (events.length < 3 && next.length >= 3) captureConversionEvent("personal_signature_created", locale, { sampleBand: "3-4" });
      window.setTimeout(() => document.getElementById("dream-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    } catch { setError(locale === "ko" ? "꿈은 4,000자 안에서 한 문장 이상 적어주세요." : "Please enter at least one sentence, up to 4,000 characters."); }
    finally { setWorking(false); }
  }
  function doFollowUp(event: DreamEvent, days: 3 | 7 | 30, formData: FormData) {
    const completed = completeDreamFollowUp(event, { dueDays: days, outcome: String(formData.get("outcome")) as "none", note: String(formData.get("note") ?? ""), fit: String(formData.get("fit")) as "MATCH", completedAt: new Date().toISOString() });
    const next = events.map((item) => item.id === completed.id ? completed : item); persist(next); setSelected(completed);
    void syncFollowUpIfSignedIn(completed, days, formData);
    captureConversionEvent("reality_check_completed", locale, { dueDays: days });
    captureConversionEvent("dream_followup_conversion", locale, { dueDays: days });
  }
  async function syncFollowUpIfSignedIn(completed: DreamEvent, days: 3 | 7 | 30, data: FormData) {
    const client = getBrowserSupabaseClient();
    if (!client) return;
    try {
      const auth = await client.auth.getSession();
      if (!auth.data.session?.user) return;
      await fetch(`/api/dreams/${completed.id}/followups`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: `followup_${days}_${completed.id}`, dueDays: days, outcome: String(data.get("outcome") ?? "none"), note: String(data.get("note") ?? ""), fit: String(data.get("fit") ?? "CONTEXT_DEPENDENT"), interpretation: completed.revisions.at(-1)?.interpretation }) });
    } catch { /* Device record remains authoritative when account sync is unavailable. */ }
  }
  const report = selected?.initialInterpretation;
  const sources = report ? dreamSourcesById(report.sourceIds) : [];
  const confidenceRows = report ? [[locale === "ko" ? "전통 근거" : "Tradition", report.confidence.tradition], [locale === "ko" ? "현대 연구 연결" : "Modern research", report.confidence.modernResearch], [locale === "ko" ? "현재 상황 일치" : "Current context", report.confidence.currentContext], [locale === "ko" ? "개인 반복 근거" : "Personal repetition", report.confidence.personalHistory], [locale === "ko" ? "사후 확인" : "Later checks", report.confidence.outcomeEvidence], [locale === "ko" ? "전체" : "Overall", report.confidence.overall]] as const : [];
  return <main className={styles.page} id="main-content">
    <header className={styles.nav}><Link href={`/${locale}`} className={styles.brand}>{t.brand}<small>PERSONAL PATTERN INTELLIGENCE</small></Link><nav aria-label={t.nav}><a href="#record">{t.nav}</a><a href="#signature">{t.pattern}</a><Link href={`/${locale}/me`}>{t.account}</Link><Link href={locale === "ko" ? "/en/dreams" : "/ko/dreams"}>{locale === "ko" ? "EN" : "한국어"}</Link></nav></header>
    <section className={styles.hero}><div><p>{t.eyebrow}</p><h1>{t.title}</h1><span>{t.lead}</span><a href="#record">{t.start}<b aria-hidden="true">↓</b></a></div><div className={styles.dreamCard} aria-hidden="true"><span>昨夜夢</span><i /><strong>{locale === "ko" ? "장면" : "SCENE"}</strong><strong>{locale === "ko" ? "감정" : "FEELING"}</strong><strong>{locale === "ko" ? "현실" : "LIFE"}</strong><strong>{locale === "ko" ? "기록" : "RECORD"}</strong></div></section>
    <section className={styles.record} id="record"><header><small>01</small><div><p>{t.eyebrow}</p><h2>{t.inputTitle}</h2><span>{t.inputHelp}</span></div></header><form onSubmit={submit}><label className={styles.mainInput}><span>{locale === "ko" ? "꿈 내용" : "Dream"}</span><textarea maxLength={4000} minLength={1} onChange={(e) => setForm({ ...form, rawText: e.target.value })} placeholder={t.placeholder} required rows={7} value={form.rawText} /><small>{form.rawText.length} / 4,000</small></label><div className={styles.formGrid}><label><span>{locale === "ko" ? "꿈을 꾼 날" : "Dream date"}</span><input max={today()} onChange={(e) => setForm({ ...form, dreamDate: e.target.value })} required type="date" value={form.dreamDate} /></label><label><span>{t.concern}</span><input maxLength={500} onChange={(e) => setForm({ ...form, currentConcern: e.target.value })} placeholder={t.concernPlaceholder} value={form.currentConcern} /></label><label className={styles.wide}><span>{t.recent}</span><input maxLength={800} onChange={(e) => setForm({ ...form, recentExperience: e.target.value })} placeholder={t.recentPlaceholder} value={form.recentExperience} /></label></div><div className={styles.checks}><label><input checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} type="checkbox" />{t.recurring}</label><label><input checked={form.lucid} onChange={(e) => setForm({ ...form, lucid: e.target.checked })} type="checkbox" />{t.lucid}</label><label><input checked={form.retainRawText} onChange={(e) => setForm({ ...form, retainRawText: e.target.checked })} type="checkbox" />{t.retain}<small>{t.retainHelp}</small></label><label><input checked={form.allowRemoteAI} onChange={(e) => setForm({ ...form, allowRemoteAI: e.target.checked })} type="checkbox" />{t.remoteAI}<small>{t.remoteAIHelp}</small></label></div>{error && <p role="alert" className={styles.error}>{error}</p>}<button className={styles.primary} disabled={working} type="submit">{working ? (locale === "ko" ? "기록을 살펴보는 중…" : "Reviewing the record…") : t.submit}<span aria-hidden="true">→</span></button></form></section>
    {report && selected && <section className={styles.result} id="dream-result"><header><small>02 · {t.report}</small><h2>{report.headline}</h2><p>{report.title} · {selected.dreamDate}</p></header><div className={styles.reportGrid}><article className={styles.summary}><small>{t.summary}</small><p>{report.normalizedSummary}</p><div><span>{t.symbols}</span>{report.ontology.slice(0, 8).map((token) => <b key={`${token.kind}:${token.code}`}>{token.label[locale]}<small>{token.kind.toUpperCase()}</small></b>)}</div><div><span>{t.categories}</span>{report.categories.map((category) => <em key={category}>{categoryLabels[category]?.[locale] ?? category}</em>)}</div></article>{(["tradition", "modernResearch", "personalContext", "symbolicSystems", "personalHistory"] as const).map((layer, index) => <article className={styles.layer} key={layer}><small>0{index + 1}</small><h3>{[t.tradition, t.modern, t.personal, t.systems, t.history][index]}</h3>{report.layers[layer].map((item, itemIndex) => <div key={itemIndex}><p>{item.statement}</p><footer><b>{confidenceLabels[item.confidence][locale]}</b><span>{item.limitation}</span></footer></div>)}</article>)}</div>
      <div className={styles.evidence}><article><h3>{t.confidence}</h3><dl>{confidenceRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{confidenceLabels[value]?.[locale] ?? value}</dd></div>)}</dl></article>{report.followUpQuestions.length > 0 && <article><h3>{t.questions}</h3><ol>{report.followUpQuestions.map((question) => <li key={question.id}><strong>{question.question}</strong><span>{question.reason}</span></li>)}</ol></article>}<article><h3>{t.sources}</h3><ol>{sources.map((source) => <li key={source.sourceId}><a href={source.citation} rel="noreferrer" target="_blank">{source.title}</a><span>{source.culture} · Tier {source.academicQuality}</span></li>)}</ol></article><article className={styles.safety}><h3>{t.safety}</h3>{report.safetyNotices.map((notice) => <p key={notice}>{notice}</p>)}</article>{selected.revisions.length > 0 && <article className={styles.revisions}><h3>{t.revisions}</h3><p>{t.initialLocked}</p><ol>{selected.revisions.toReversed().map((revision) => <li key={revision.revision}><time>{revision.createdAt.slice(0, 10)}</time><strong>{revision.reason}</strong><span>{confidenceLabels[revision.interpretation.confidence.outcomeEvidence][locale]}</span></li>)}</ol></article>}</div>
      <p className={styles.saved}>{t.saveNote}</p><button className={styles.secondary} onClick={() => { setSelected(null); setForm({ dreamDate: today(), rawText: "", currentConcern: "", recentExperience: "", recurring: false, lucid: false, retainRawText: false, allowRemoteAI: false }); document.getElementById("record")?.scrollIntoView({ behavior: "smooth" }); }} type="button">{t.newDream}</button>
    </section>}
    <section className={styles.history} id="signature"><header><small>03</small><div><p>{t.signature}</p><h2>{signature.status === "insufficient" ? signature.note : locale === "ko" ? `${signature.sampleSize}개의 꿈에서 반복된 장면을 모았어요.` : `Patterns across ${signature.sampleSize} dreams.`}</h2></div></header><div className={styles.patterns}>{signature.status !== "insufficient" && <>{signature.recurringEntities.map((item) => <article key={`e-${item.code}`}><span>{locale === "ko" ? "장면" : "Scene"}</span><strong>{item.label}</strong><b>{item.count}{locale === "ko" ? "회" : "×"}</b></article>)}{signature.recurringEmotions.map((item) => <article key={`m-${item.code}`}><span>{locale === "ko" ? "감정" : "Feeling"}</span><strong>{item.label}</strong><b>{item.count}{locale === "ko" ? "회" : "×"}</b></article>)}</>}</div><label className={styles.search}><span>{t.search}</span><input onFocus={() => captureConversionEvent("pattern_view_opened", locale, {})} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} value={search} /></label><div className={styles.timeline}><h3>{t.timeline}</h3>{filtered.length === 0 ? <p>{t.noDreams}</p> : filtered.map((event) => <article key={event.id}><button onClick={() => { setSelected(event); document.getElementById("dream-result")?.scrollIntoView({ behavior: "smooth" }); }} type="button"><time>{event.dreamDate}</time><strong>{event.initialInterpretation.title}</strong><span>{event.initialInterpretation.ontology.filter((token) => token.kind === "emotion").map((token) => token.label[locale]).join(" · ") || (locale === "ko" ? "감정 미기록" : "No feeling recorded")}</span></button><details><summary>{t.followup}</summary>{event.followUps.map((followUp) => isDue(followUp.dueDate) || followUp.completedAt ? <form key={followUp.dueDays} action={(data) => doFollowUp(event, followUp.dueDays, data)}><strong>+{followUp.dueDays}{locale === "ko" ? "일" : "d"}</strong><span>{t.followupQuestion}</span><select defaultValue={followUp.outcome ?? "none"} name="outcome"><option value="none">{t.noEvent}</option><option value="money">{locale === "ko" ? "돈" : "Money"}</option><option value="work">{locale === "ko" ? "직장" : "Work"}</option><option value="new_person">{locale === "ko" ? "새로운 사람" : "New person"}</option><option value="relationship">{locale === "ko" ? "연애·관계" : "Relationship"}</option><option value="family">{locale === "ko" ? "가족" : "Family"}</option><option value="health">{locale === "ko" ? "건강·생활" : "Health & daily life"}</option><option value="exam">{locale === "ko" ? "시험" : "Exam"}</option><option value="business">{locale === "ko" ? "사업" : "Business"}</option><option value="move">{locale === "ko" ? "이동·이사" : "Move"}</option><option value="other">{locale === "ko" ? "기타" : "Other"}</option></select><select defaultValue={followUp.fit ?? "CONTEXT_DEPENDENT"} name="fit"><option value="MATCH">{t.matched}</option><option value="PARTIAL">{t.partial}</option><option value="MISMATCH">{t.mismatch}</option><option value="CONTEXT_DEPENDENT">{t.context}</option></select><input defaultValue={followUp.note} maxLength={1000} name="note" placeholder={locale === "ko" ? "기억할 내용을 짧게 적어주세요." : "Add a short note."} /><button type="submit">{followUp.completedAt ? (locale === "ko" ? "수정해 저장" : "Update") : t.followupSave}</button></form> : <p className={styles.notDue} key={followUp.dueDays}>+{followUp.dueDays}{locale === "ko" ? `일 · ${followUp.dueDate}에 열려요.` : `d · Opens ${followUp.dueDate}.`}</p>)}</details></article>)}</div><div className={styles.dataActions}><button disabled={!events.length} onClick={() => download(`taeryeongdang-dreams-${today()}.json`, exportDreamEvents(events, new Date().toISOString()))} type="button">{t.export}</button><button disabled={!events.length} onClick={() => void clearAll()} type="button">{t.clear}</button></div></section>
    <footer className={styles.footer}><strong>{t.brand}</strong><p>{locale === "ko" ? "꿈은 답을 정하는 도구가 아니라, 내 삶의 반복을 돌아보는 기록입니다." : "Dreams do not decide the answer. They can be a record for reflecting on what repeats."}</p><Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보 처리방침" : "Privacy"}</Link></footer>
  </main>;
}
