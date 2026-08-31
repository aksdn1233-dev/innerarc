"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  analyzeCardCombination,
  clearTarotHistory,
  createManualTarotReading,
  createSavedTarotReading,
  drawTarot,
  exportTarotHistory,
  InMemoryTarotHistoryRepository,
  loadTarotHistory,
  restoreTarotReading,
  saveTarotHistory,
  TAROT_DECK,
  TarotInputError,
  type CombinationInsight,
  type SavedTarotReading,
  type TarotDrawnCard,
  type TarotOrientation,
  type TarotQuestionCategory,
  type TarotReading,
} from "@/core/tarot";
import {
  assessQuestionSafety,
  type SafetyAssessment,
} from "@/core/ai/safety";
import { CRISIS_RESOURCES, getCrisisResourceCopy } from "@/core/ai/crisis-resources";
import type { Locale } from "@/i18n/config";
import type { QuestionCopy } from "@/i18n/question-copy";
import { focusAndScroll, scrollToElement } from "@/components/accessibility";
import { WebtoonCue, WebtoonPanel } from "@/components/webtoon";
import { WebtoonReveal } from "@/components/webtoon-reveal";

type Props = { locale: Locale; copy: QuestionCopy };

const suitMarks = {
  wands: "│",
  cups: "◡",
  swords: "†",
  pentacles: "◇",
} as const;

function TarotCardPortrait({ drawn }: { drawn: TarotDrawnCard }) {
  const indexLabel = drawn.card.arcana === "major"
    ? String(drawn.card.number ?? 0).padStart(2, "0")
    : drawn.card.rank?.slice(0, 2).toUpperCase() ?? "–";
  const mark = drawn.card.suit ? suitMarks[drawn.card.suit] : "○";

  return (
    <div
      className="tarot-card-face"
      data-arcana={drawn.card.arcana}
      data-orientation={drawn.orientation}
      aria-hidden="true"
    >
      <span className="tarot-card-index tarot-card-index-top">{indexLabel}</span>
      <div className="tarot-illustration">
        <span className="tarot-halo" />
        <span className="tarot-sigil">{mark}</span>
        <span className="tarot-horizon" />
        <span className="tarot-path" />
      </div>
      <span className="tarot-card-index tarot-card-index-bottom">{indexLabel}</span>
    </div>
  );
}

export function QuestionTarotExperience({ locale, copy }: Props) {
  const historyRepository = useRef(new InMemoryTarotHistoryRepository());
  const [category, setCategory] = useState<TarotQuestionCategory>("work");
  const [cardCount, setCardCount] = useState<1 | 3>(3);
  const [mode, setMode] = useState<"engine" | "manual">("engine");
  const [allowReversals, setAllowReversals] = useState(true);
  const [manualCards, setManualCards] = useState(["major-00", "major-01", "major-02"]);
  const [manualOrientations, setManualOrientations] = useState<TarotOrientation[]>(["upright", "upright", "upright"]);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [assessment, setAssessment] = useState<SafetyAssessment | null>(null);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [combination, setCombination] = useState<CombinationInsight | null>(null);
  const [history, setHistory] = useState<SavedTarotReading[]>([]);
  const [devicePersistence, setDevicePersistence] = useState(false);
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (assessment) focusAndScroll("#tarot-safety");
  }, [assessment]);

  useEffect(() => {
    if (reading) focusAndScroll("#tarot-result");
  }, [reading]);

  function performReading(question: string) {
    try {
      const spreadId = cardCount === 1 ? "single" : `question_${category}` as const;
      const nextReading = mode === "engine"
        ? drawTarot({ spreadId, allowReversals })
        : createManualTarotReading({
            spreadId,
            cards: manualCards.slice(0, cardCount).map((cardId, index) => ({
              cardId,
              orientation: manualOrientations[index],
            })),
            eventId: `manual-${crypto.randomUUID()}`,
          });
      setReading(nextReading);
      setCombination(analyzeCardCombination(nextReading.cards, locale));
      setAssessment(null);
      setPendingQuestion(question);
      setCurrentSavedId(null);
      setError("");
    } catch (caught) {
      setReading(null);
      setCombination(null);
      setError(caught instanceof TarotInputError ? copy.manualError : copy.manualError);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const question = String(form.get("question") ?? "").trim();
    const nextAssessment = assessQuestionSafety(question);
    setReading(null);
    setCombination(null);
    setCurrentSavedId(null);
    setError("");
    setPendingQuestion(question);
    if (nextAssessment.category !== "general") {
      setAssessment(nextAssessment);
      return;
    }
    performReading(question);
  }

  function reset() {
    setReading(null);
    setCombination(null);
    setAssessment(null);
    setPendingQuestion("");
    setCurrentSavedId(null);
    setError("");
    scrollToElement("#question-form");
  }

  function syncHistory() {
    const next = historyRepository.current.list();
    setHistory(next);
    if (devicePersistence) saveTarotHistory(window.localStorage, next);
  }

  function saveCurrentReading() {
    if (!reading || currentSavedId) return;
    const saved = createSavedTarotReading({
      id: crypto.randomUUID(),
      clientRequestId: `save:${crypto.randomUUID()}`,
      question: pendingQuestion,
      category,
      createdAt: new Date().toISOString(),
      reading,
    });
    historyRepository.current.create(saved);
    setCurrentSavedId(saved.id);
    syncHistory();
  }

  function toggleDevicePersistence(checked: boolean) {
    setDevicePersistence(checked);
    if (checked) saveTarotHistory(window.localStorage, historyRepository.current.list());
  }

  function loadHistoryFromDevice() {
    historyRepository.current.replace(loadTarotHistory(window.localStorage));
    setHistory(historyRepository.current.list());
    setDevicePersistence(true);
  }

  function clearHistoryAll() {
    if (!window.confirm(copy.clearHistory)) return;
    clearTarotHistory(window.localStorage);
    historyRepository.current.replace([]);
    setHistory([]);
    setCurrentSavedId(null);
    setDevicePersistence(false);
  }

  function removeSavedReading(id: string) {
    historyRepository.current.remove(id);
    if (currentSavedId === id) setCurrentSavedId(null);
    syncHistory();
  }

  function openSavedReading(saved: SavedTarotReading) {
    const restored = restoreTarotReading(saved.snapshot);
    setReading(restored);
    setCombination(analyzeCardCombination(restored.cards, locale));
    setPendingQuestion(saved.question);
    setCategory(saved.category);
    setCardCount(restored.spread.cardCount);
    setMode(restored.audit.source);
    setManualCards(restored.cards.map((item) => item.card.id));
    setManualOrientations(restored.cards.map((item) => item.orientation));
    setAssessment(null);
    setCurrentSavedId(saved.id);
  }

  function downloadHistory() {
    const content = exportTarotHistory(history, new Date().toISOString());
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `taeryeongdang-tarot-history-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const otherLocale = locale === "ko" ? "en" : "ko";
  const crisisCopy = getCrisisResourceCopy(locale);

  return (
    <>
      <main className="shell question-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>태령당</strong>
            <small>{copy.eyebrow}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/question`}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="question-intro">
          <div className="question-intro-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.headline}</h1>
            <p>{copy.intro}</p>
          </div>
          <aside className="reading-room-note">
            <span className="reading-room-label">{copy.roomLabel}</span>
            <div className="card-back-fan" aria-hidden="true">
              <span className="card-back card-back-left" />
              <span className="card-back card-back-center"><i /></span>
              <span className="card-back card-back-right" />
            </div>
            <p>{copy.roomPrompt}</p>
          </aside>
        </section>

        <form className="question-form" id="question-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="tarot-question">{copy.questionLabel}</label>
            <textarea
              id="tarot-question"
              name="question"
              required
              maxLength={2_000}
              defaultValue={pendingQuestion}
              placeholder={copy.questionPlaceholder}
            />
          </div>

          <fieldset className="field">
            <legend>{copy.modeLabel}</legend>
            <div className="choice-row source-options">
              <label className="choice">
                <input type="radio" name="source" checked={mode === "engine"} onChange={() => setMode("engine")} />
                <span>{copy.randomMode}</span>
              </label>
              <label className="choice">
                <input type="radio" name="source" checked={mode === "manual"} onChange={() => setMode("manual")} />
                <span>{copy.manualMode}</span>
              </label>
            </div>
          </fieldset>

          <div className="question-options">
            <div className="field">
              <label htmlFor="question-category">{copy.categoryLabel}</label>
              <select
                id="question-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as TarotQuestionCategory)}
              >
                {Object.entries(copy.categories).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </div>

            <fieldset className="field">
              <legend>{copy.spreadLabel}</legend>
              <div className="choice-row">
                <label className="choice">
                  <input
                    type="radio"
                    name="cardCount"
                    checked={cardCount === 1}
                    onChange={() => setCardCount(1)}
                  />
                  <span>{copy.oneCard}</span>
                </label>
                <label className="choice">
                  <input
                    type="radio"
                    name="cardCount"
                    checked={cardCount === 3}
                    onChange={() => setCardCount(3)}
                  />
                  <span>{copy.threeCards}</span>
                </label>
              </div>
            </fieldset>
          </div>

          {mode === "engine" ? (
            <label className="check">
              <input
                type="checkbox"
                checked={allowReversals}
                onChange={(event) => setAllowReversals(event.target.checked)}
              />
              <span>{copy.reversals}</span>
            </label>
          ) : (
            <section className="manual-entry" aria-label={copy.manualMode}>
              <p>{copy.manualIntro}</p>
              {Array.from({ length: cardCount }, (_, index) => (
                <div className="manual-card-row" key={index}>
                  <div className="field">
                    <label htmlFor={`manual-card-${index}`}>{copy.selectCard} {index + 1}</label>
                    <select
                      id={`manual-card-${index}`}
                      value={manualCards[index]}
                      onChange={(event) => setManualCards((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                    >
                      {TAROT_DECK.map((card) => <option key={card.id} value={card.id}>{card.name[locale]}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor={`manual-orientation-${index}`}>{copy.reversals}</label>
                    <select
                      id={`manual-orientation-${index}`}
                      value={manualOrientations[index]}
                      onChange={(event) => setManualOrientations((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value as TarotOrientation : item))}
                    >
                      <option value="upright">{copy.upright}</option>
                      <option value="reversed">{copy.reversed}</option>
                    </select>
                  </div>
                </div>
              ))}
            </section>
          )}
          <button className="primary-button" type="submit">{copy.draw}</button>
          {error && <span className="error tarot-error" role="alert">{error}</span>}
        </form>

        {assessment && (
          <section
            className={assessment.requiresUrgentSafetyResponse ? "safety-panel urgent" : "safety-panel"}
            aria-live="assertive"
            id="tarot-safety"
            tabIndex={-1}
          >
            <h2>
              {assessment.requiresUrgentSafetyResponse ? copy.urgentTitle : copy.safetyTitle}
            </h2>
            <p>
              {assessment.requiresUrgentSafetyResponse ? copy.urgentGuidance : copy.realityFirst}
            </p>
            {assessment.category === "self_harm" && (
              <div className="crisis-resources">
                <h3>{crisisCopy.title}</h3>
                <p>{crisisCopy.emergency}</p>
                <p className="privacy-note">{crisisCopy.locationCaution}</p>
                <div className="crisis-resource-list">
                  {CRISIS_RESOURCES.map((resource) => (
                    <article key={resource.regionCode}>
                      <strong>{resource.service[locale]}</strong>
                      <span>{resource.availability[locale]}</span>
                      <div>
                        <a className="primary-button" href={resource.contactHref}>{resource.contactLabel[locale]}</a>
                        <a href={resource.officialUrl} target="_blank" rel="noreferrer">
                          {crisisCopy.officialSource} · {resource.publisher[locale]}
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            {assessment.allowSymbolicReflection && (
              <button
                className="primary-button"
                type="button"
                onClick={() => performReading(pendingQuestion)}
              >
                {copy.symbolicContinue}
              </button>
            )}
          </section>
        )}

        {reading && (
          <section className="tarot-result webtoon-flow" id="tarot-result" aria-live="polite" tabIndex={-1}>
            <WebtoonReveal />

            <WebtoonPanel
              badge={copy.roomLabel}
              className="tarot-result-heading"
              lead={copy.resultIntro}
              title={copy.resultTitle}
              tone="night"
            >
              <WebtoonCue />
            </WebtoonPanel>

            {/* One card to a panel. A spread laid out as a grid asks to be taken in all at
                once, which is the opposite of how a card is meant to land; drawn down the
                page each one arrives on its own, and the card markup is untouched. */}
            {reading.cards.map((drawn, index) => (
              <section
                className={`webtoon-panel ${index % 2 === 0 ? "webtoon-paper" : "webtoon-night"}`}
                data-webtoon-panel=""
                key={drawn.position.en}
              >
                <div className="webtoon-inner">
                  <article className="tarot-card" data-orientation={drawn.orientation}>
                    <TarotCardPortrait drawn={drawn} />
                    <div className="tarot-card-copy">
                      <span className="tarot-position">{drawn.position[locale]}</span>
                      <h3>{drawn.card.name[locale]}</h3>
                      <p className="orientation">
                        {drawn.orientation === "upright" ? copy.upright : copy.reversed}
                      </p>
                      <p>
                        {drawn.orientation === "upright"
                          ? drawn.card.uprightKeywords[locale]
                          : drawn.card.reversedKeywords[locale]}
                      </p>
                    </div>
                  </article>
                </div>
              </section>
            ))}

            {combination && combination.messages.length > 0 && (
              <WebtoonPanel className="reflection-block" title={copy.combination} tone="gold">
                <ul>{combination.messages.map((message) => <li key={message}>{message}</li>)}</ul>
              </WebtoonPanel>
            )}

            <WebtoonPanel className="reflection-block" title={copy.realityChecks} tone="paper">
              <ol className="webtoon-steps">{copy.realityItems.map((item) => <li key={item}>{item}</li>)}</ol>
            </WebtoonPanel>

            <section className="webtoon-panel webtoon-paper webtoon-outro" data-webtoon-panel="">
              <div className="webtoon-inner">
                <details className="tarot-audit">
                  <summary>{copy.audit}</summary>
                  <p>{copy.auditHelp}</p>
                  <dl className="audit-list">
                    <div><dt>{copy.source}</dt><dd>{reading.audit.source === "engine" ? copy.engineSource : copy.manualSource}</dd></div>
                    <div><dt>Event</dt><dd>{reading.audit.eventId}</dd></div>
                    <div><dt>Deck</dt><dd>{reading.audit.deckVersion}</dd></div>
                    <div><dt>Algorithm</dt><dd>{reading.audit.algorithmVersion}</dd></div>
                    <div><dt>Seed</dt><dd>{reading.audit.seed ?? "—"}</dd></div>
                  </dl>
                </details>

                <p className="disclaimer">{copy.disclaimer}</p>
                <button className="primary-button save-reading" type="button" onClick={saveCurrentReading} disabled={Boolean(currentSavedId)}>
                  {currentSavedId ? copy.savedReading : copy.saveReading}
                </button>
                <button className="text-button" type="button" onClick={reset}>
                  {copy.newQuestion}
                </button>
              </div>
            </section>
          </section>
        )}

        <section className="tarot-history" aria-labelledby="tarot-history-title">
          <header>
            <div>
              <p className="eyebrow">{copy.savedReading}</p>
              <h2 id="tarot-history-title">{copy.historyTitle}</h2>
            </div>
            <label className="check">
              <input type="checkbox" checked={devicePersistence} onChange={(event) => toggleDevicePersistence(event.target.checked)} />
              <span>{copy.storageChoice}</span>
            </label>
          </header>
          <p className="history-warning">{copy.storageWarning}</p>
          <div className="history-actions">
            <button type="button" onClick={loadHistoryFromDevice}>{copy.loadHistory}</button>
            <button type="button" onClick={downloadHistory} disabled={!history.length}>{copy.exportHistory}</button>
            <button type="button" onClick={clearHistoryAll}>{copy.clearHistory}</button>
          </div>
          {!history.length && <p className="empty-state">{copy.noHistory}</p>}
          <div className="history-list">
            {history.map((saved) => (
              <article key={saved.id}>
                <div>
                  <span>{saved.snapshot.audit.source === "engine" ? copy.engineSource : copy.manualSource}</span>
                  <h3>{saved.question}</h3>
                  <small>{copy.categories[saved.category]} · {saved.createdAt.slice(0, 10)}</small>
                </div>
                <footer>
                  <button type="button" onClick={() => openSavedReading(saved)}>{copy.openReading}</button>
                  <button type="button" onClick={() => removeSavedReading(saved.id)}>{copy.deleteReading}</button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
