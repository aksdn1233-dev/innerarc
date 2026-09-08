"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  clearRealityCheckHandoff,
  clearRealityChecks,
  createMonthlyPatternReport,
  createRealityCheckRecord,
  createRealityCheckQueue,
  exportRealityChecks,
  fitRatings,
  InMemoryRealityCheckRepository,
  listMonthlyReportMonths,
  loadRealityChecks,
  MONTHLY_PATTERN_RULE_VERSION,
  parseRealityCheckHandoff,
  REALITY_CHECK_HANDOFF_STORAGE_KEY,
  RealityCheckHandoffSchema,
  RealityCheckInputError,
  realityCheckQueueFilters,
  reflectionCategories,
  type RealityCheckQueueFilter,
  saveRealityChecks,
  type RealityCheckRecord,
  type ReflectionCategory,
} from "@/core/reality-check";
import type { Locale } from "@/i18n/config";
import type { RealityCheckCopy } from "@/i18n/reality-check-copy";
import { focusAndScroll } from "@/components/accessibility";

type Props = { locale: Locale; copy: RealityCheckCopy };

function localIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextWeek(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return localIsoDate(date);
}

function subscribeToLocalDate(onDateChange: () => void): () => void {
  let previous = localIsoDate();
  const check = () => {
    const current = localIsoDate();
    if (current !== previous) {
      previous = current;
      onDateChange();
    }
  };
  const interval = window.setInterval(check, 60_000);
  document.addEventListener("visibilitychange", check);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", check);
  };
}

function getLocalDateSnapshot(): string | null {
  return localIsoDate();
}

function getServerDateSnapshot(): string | null {
  return null;
}

let cachedHandoffSnapshot: string | null | undefined;
let handoffCacheReleaseTimer: number | undefined;
const INVALID_HANDOFF_SNAPSHOT = "\u0000";

function subscribeToHandoff(): () => void {
  if (handoffCacheReleaseTimer !== undefined) {
    window.clearTimeout(handoffCacheReleaseTimer);
    handoffCacheReleaseTimer = undefined;
  }
  return () => {
    handoffCacheReleaseTimer = window.setTimeout(() => {
      cachedHandoffSnapshot = undefined;
      handoffCacheReleaseTimer = undefined;
    }, 0);
  };
}

function getHandoffSnapshot(): string | null {
  if (cachedHandoffSnapshot !== undefined) return cachedHandoffSnapshot;
  try {
    const raw = window.sessionStorage.getItem(REALITY_CHECK_HANDOFF_STORAGE_KEY);
    if (!raw) {
      cachedHandoffSnapshot = null;
      return cachedHandoffSnapshot;
    }
    const locale = (JSON.parse(raw) as { locale?: unknown }).locale;
    cachedHandoffSnapshot =
      (locale === "ko" || locale === "en")
      && parseRealityCheckHandoff(raw, locale, new Date().toISOString())
        ? raw
        : INVALID_HANDOFF_SNAPSHOT;
    return cachedHandoffSnapshot;
  } catch {
    cachedHandoffSnapshot = INVALID_HANDOFF_SNAPSHOT;
    return cachedHandoffSnapshot;
  }
}

function getServerHandoffSnapshot(): string | null {
  return null;
}

function requestId(prefix: string): string {
  return `${prefix}:${crypto.randomUUID()}`;
}

export function RealityCheckExperience({ locale, copy }: Props) {
  const repository = useRef(new InMemoryRealityCheckRepository());
  const [records, setRecords] = useState<RealityCheckRecord[]>([]);
  const [devicePersistence, setDevicePersistence] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<RealityCheckQueueFilter>("all");
  const [selectedReportMonth, setSelectedReportMonth] = useState<string | null>(null);
  const [error, setError] = useState("");
  const today = useSyncExternalStore(
    subscribeToLocalDate,
    getLocalDateSnapshot,
    getServerDateSnapshot,
  );
  const handoffRaw = useSyncExternalStore(
    subscribeToHandoff,
    getHandoffSnapshot,
    getServerHandoffSnapshot,
  );
  const handoff = useMemo(
    () => {
      if (!handoffRaw || handoffRaw === INVALID_HANDOFF_SNAPSHOT) return null;
      try {
        const parsed = RealityCheckHandoffSchema.safeParse(JSON.parse(handoffRaw));
        return parsed.success && parsed.data.locale === locale ? parsed.data : null;
      } catch {
        return null;
      }
    },
    [handoffRaw, locale],
  );
  const otherLocale = locale === "ko" ? "en" : "ko";
  const currentMonth = today?.slice(0, 7) ?? null;
  const reportMonths = useMemo(
    () => currentMonth ? listMonthlyReportMonths(records, currentMonth) : [],
    [currentMonth, records],
  );
  const reportMonth = selectedReportMonth && reportMonths.includes(selectedReportMonth)
    ? selectedReportMonth
    : currentMonth;
  const report = reportMonth ? createMonthlyPatternReport(records, reportMonth) : null;
  const queue = useMemo(
    () => today ? createRealityCheckQueue(records, today, queueFilter) : null,
    [queueFilter, records, today],
  );

  useEffect(() => {
    if (handoffRaw === null) return;
    try {
      clearRealityCheckHandoff(window.sessionStorage);
    } catch {
      // The prefill is already in memory; an unavailable store must not create a persistent fallback.
    }
  }, [handoffRaw]);

  function syncRecords() {
    const next = repository.current.list();
    setRecords(next);
    if (devicePersistence) saveRealityChecks(window.localStorage, next);
  }

  function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!today) {
      setError(copy.invalid);
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const record = createRealityCheckRecord({
        clientRequestId: requestId("create"),
        category: String(form.get("category")) as ReflectionCategory,
        question: String(form.get("question") ?? ""),
        currentState: String(form.get("currentState") ?? ""),
        interpretation: String(form.get("interpretation") ?? ""),
        choice: String(form.get("choice") ?? ""),
        actionPlan: String(form.get("actionPlan") ?? ""),
        reviewDate: String(form.get("reviewDate") ?? ""),
      }, {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdDate: today,
      });
      repository.current.create(record);
      syncRecords();
      formElement.reset();
      focusAndScroll("#reality-records");
    } catch (caught) {
      setError(caught instanceof RealityCheckInputError ? copy.invalid : copy.invalid);
    }
  }

  function saveReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewingId) return;
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const reviewedAt = new Date().toISOString();
      repository.current.review(reviewingId, {
        clientRequestId: requestId("review"),
        outcome: String(form.get("outcome") ?? ""),
        fit: String(form.get("fit")) as (typeof fitRatings)[number],
        learning: String(form.get("learning") ?? ""),
      }, reviewedAt, localIsoDate().slice(0, 7));
      syncRecords();
      setReviewingId(null);
    } catch (caught) {
      setError(caught instanceof RealityCheckInputError ? copy.invalid : copy.invalid);
    }
  }

  function toggleDevicePersistence(checked: boolean) {
    setDevicePersistence(checked);
    if (checked) saveRealityChecks(window.localStorage, repository.current.list());
  }

  function loadFromDevice() {
    try {
      repository.current.replace(loadRealityChecks(window.localStorage));
      setRecords(repository.current.list());
      setDevicePersistence(true);
      setError("");
    } catch {
      setError(copy.invalid);
    }
  }

  function clearAll() {
    if (!window.confirm(copy.clearDevice)) return;
    clearRealityChecks(window.localStorage);
    repository.current.replace([]);
    setRecords([]);
    setReviewingId(null);
    setDevicePersistence(false);
  }

  function removeRecord(id: string) {
    repository.current.remove(id);
    syncRecords();
    if (reviewingId === id) setReviewingId(null);
  }

  function startReview(id: string) {
    setReviewingId(id);
    focusAndScroll("#review-panel");
  }

  function downloadExport() {
    const content = exportRealityChecks(records, new Date().toISOString());
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `taeryeongdang-reality-check-${today ?? localIsoDate()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function categoryList(items: readonly { category: ReflectionCategory }[]): string {
    return items.length ? items.map((item) => copy.categories[item.category]).join(" · ") : copy.none;
  }

  return (
    <>
      <main className="shell reality-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>태령당</strong>
            <small>{copy.brandTagline}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/reality-check`} prefetch={false}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="reality-intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.headline}</h1>
          <p>{copy.intro}</p>
        </section>

        <section className="reality-layout">
          <form
            className="reality-form"
            key={handoff?.handoffId ?? "blank-handoff"}
            onSubmit={createRecord}
            noValidate
          >
            <h2>{copy.formTitle}</h2>
            {handoff && (
              <aside className="handoff-notice" role="status">
                <strong>{handoff.source === "success_story" ? (locale === "ko" ? "성공 스토리에서 고른 행동을 일회성 초안으로 불러왔습니다." : "Your selected success-story action was loaded as a one-time draft.") : copy.handoffLoaded}</strong>
                <span>{handoff.source === "success_story" ? (locale === "ko" ? "성공 패턴 현실 비교에서 이어짐" : "Continued from success-pattern reality comparison") : copy.handoffSource}</span>
                <small>{copy.handoffPrivacy}</small>
              </aside>
            )}
            <div className="field">
              <label htmlFor="reality-category">{copy.category}</label>
              <select
                id="reality-category"
                name="category"
                defaultValue={handoff?.category ?? "relationship"}
              >
                {reflectionCategories.map((category) => (
                  <option key={category} value={category}>{copy.categories[category]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="reality-question">{copy.question}</label>
              <textarea
                id="reality-question"
                name="question"
                maxLength={1_000}
                defaultValue={handoff?.question}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reality-state">{copy.currentState}</label>
              <textarea
                id="reality-state"
                name="currentState"
                maxLength={1_000}
                defaultValue={handoff?.currentState}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reality-interpretation">{copy.interpretation}</label>
              <textarea
                id="reality-interpretation"
                name="interpretation"
                maxLength={2_000}
                defaultValue={handoff?.interpretation}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reality-choice">{copy.choice}</label>
              <textarea
                id="reality-choice"
                name="choice"
                maxLength={1_000}
                defaultValue={handoff?.choice}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reality-action">{copy.actionPlan}</label>
              <textarea
                id="reality-action"
                name="actionPlan"
                maxLength={1_000}
                defaultValue={handoff?.actionPlan}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reality-review-date">{copy.reviewDate}</label>
              <input
                id="reality-review-date"
                key={today ?? "date-pending"}
                name="reviewDate"
                type="date"
                min={today ?? undefined}
                defaultValue={today ? nextWeek() : undefined}
                disabled={!today}
                required
              />
            </div>
            <button className="primary-button" type="submit" disabled={!today}>{copy.save}</button>
            {error && <span className="error reality-error" role="alert">{error}</span>}
          </form>

          <aside className="reality-side">
            <div className="storage-card">
              <label className="check">
                <input
                  type="checkbox"
                  checked={devicePersistence}
                  onChange={(event) => toggleDevicePersistence(event.target.checked)}
                />
                <span>{copy.storageChoice}</span>
              </label>
              <p>{copy.storageWarning}</p>
              <div className="secondary-actions">
                <button type="button" onClick={loadFromDevice}>{copy.loadDevice}</button>
                <button type="button" onClick={downloadExport} disabled={!records.length}>{copy.exportData}</button>
                <button type="button" onClick={clearAll}>{copy.clearDevice}</button>
              </div>
              <small>{copy.privacyNote}</small>
            </div>

            {report && reportMonth && <section className="pattern-report" aria-labelledby="pattern-report-title">
              <div className="pattern-report-heading">
                <div>
                  <p className="eyebrow">{reportMonth}</p>
                  <h2 id="pattern-report-title">{copy.reportTitle}</h2>
                </div>
                <label htmlFor="report-month">
                  <span>{copy.reportMonthLabel}</span>
                  <select
                    id="report-month"
                    value={reportMonth}
                    onChange={(event) => setSelectedReportMonth(event.target.value)}
                  >
                    {reportMonths.map((availableMonth) => (
                      <option key={availableMonth} value={availableMonth}>{availableMonth}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p><strong>{copy.reviewedCount}</strong><span>{report.reviewedCount}</span></p>
              <dl>
                <div><dt>{copy.repeatedlyRelevant}</dt><dd>{categoryList(report.repeatedlyRelevant)}</dd></div>
                <div><dt>{copy.uncertain}</dt><dd>{categoryList(report.uncertain)}</dd></div>
                <div><dt>{copy.notRelevant}</dt><dd>{categoryList(report.notRelevant)}</dd></div>
              </dl>
              {report.insufficientEvidence && <small>{copy.insufficient}</small>}
              {report.legacyMonthCount > 0 && (
                <small>{copy.legacyMonthNote}: {report.legacyMonthCount}</small>
              )}
              <small>{copy.ruleVersion}: {MONTHLY_PATTERN_RULE_VERSION}</small>
            </section>}
          </aside>
        </section>

        <section className="reality-records" id="reality-records" tabIndex={-1} aria-live="polite">
          {queue && queue.totalCount > 0 && (
            <section className="review-queue" aria-labelledby="review-queue-title">
              <div className="review-queue-heading">
                <div>
                  <p className="eyebrow">{copy.queueEyebrow}</p>
                  <h2 id="review-queue-title">{copy.queueTitle}</h2>
                </div>
                {queue.nextDueId && (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => startReview(queue.nextDueId!)}
                  >
                    {copy.queueNext}
                  </button>
                )}
              </div>
              <p className="review-queue-intro">
                {queue.dueCount > 0 ? copy.queueDueIntro : copy.queueClearIntro}
              </p>
              <dl className="review-queue-counts">
                <div>
                  <dt>{copy.status.due}</dt>
                  <dd>{queue.dueCount}</dd>
                </div>
                <div>
                  <dt>{copy.status.planned}</dt>
                  <dd>{queue.plannedCount}</dd>
                </div>
                <div>
                  <dt>{copy.status.reviewed}</dt>
                  <dd>{queue.reviewedCount}</dd>
                </div>
              </dl>
              <fieldset className="review-queue-filters">
                <legend>{copy.queueFilterLabel}</legend>
                <div>
                  {realityCheckQueueFilters.map((filter) => {
                    const count = filter === "all"
                      ? queue.totalCount
                      : filter === "due"
                        ? queue.dueCount
                        : filter === "planned"
                          ? queue.plannedCount
                          : queue.reviewedCount;
                    return (
                      <button
                        type="button"
                        key={filter}
                        aria-pressed={queueFilter === filter}
                        onClick={() => setQueueFilter(filter)}
                      >
                        <span>{copy.queueFilters[filter]}</span>
                        <strong>{count}</strong>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </section>
          )}
          <h2>{copy.recordsTitle}</h2>
          {!records.length && <p className="empty-state">{copy.empty}</p>}
          {records.length > 0 && queue?.items.length === 0 && (
            <p className="empty-state">{copy.queueNoMatches}</p>
          )}
          {queue?.items.map(({ record, status }) => {
            return (
              <article className="reality-record" key={record.id}>
                <header>
                  <span className={`status status-${status}`}>{copy.status[status]}</span>
                  <small>{copy.categories[record.category]} · {record.reviewDate}</small>
                </header>
                <h3>{record.question}</h3>
                <p>{record.interpretation}</p>
                <div className="record-plan"><strong>{copy.actionPlan}</strong><span>{record.actionPlan}</span></div>
                {record.review && (
                  <div className="record-outcome">
                    <strong>{copy.fit[record.review.fit]}</strong>
                    <p>{record.review.outcome}</p>
                    <small>{record.review.learning}</small>
                  </div>
                )}
                <footer>
                  {!record.review && <button type="button" onClick={() => startReview(record.id)}>{copy.reviewAction}</button>}
                  <button type="button" onClick={() => removeRecord(record.id)}>{copy.deleteAction}</button>
                </footer>
              </article>
            );
          })}
        </section>

        {reviewingId && (
          <section className="review-panel" id="review-panel" aria-labelledby="review-title" tabIndex={-1}>
            <form onSubmit={saveReview} noValidate>
              <h2 id="review-title">{copy.outcomeTitle}</h2>
              <div className="field">
                <label htmlFor="reality-outcome">{copy.outcome}</label>
                <textarea id="reality-outcome" name="outcome" maxLength={2_000} required />
              </div>
              <fieldset className="field">
                <legend>{copy.fitLabel}</legend>
                <div className="fit-options">
                  {fitRatings.map((fit, index) => (
                    <label key={fit}>
                      <input type="radio" name="fit" value={fit} defaultChecked={index === 2} />
                      <span>{copy.fit[fit]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="reality-learning">{copy.learning}</label>
                <textarea id="reality-learning" name="learning" maxLength={1_000} required />
              </div>
              <div className="form-actions">
                <button className="primary-button" type="submit">{copy.saveReview}</button>
                <button type="button" onClick={() => setReviewingId(null)}>{copy.cancel}</button>
              </div>
            </form>
          </section>
        )}
      </main>
    </>
  );
}
