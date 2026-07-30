"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import type { NumerologyProfile } from "@/core/numerology";
import type { MeetingContextId, RelationshipInsight } from "@/core/relationship";
import type { NextAnalysisContext } from "@/core/reality-check";
import { focusAndScroll, scrollToElement } from "@/components/accessibility";
import type { Locale } from "@/i18n/config";
import type { RelationshipCopy } from "@/i18n/relationship-copy";

type Props = { locale: Locale; copy: RelationshipCopy };

const RelationshipSharePanel = lazy(async () => {
  const loaded = await import("@/components/relationship-share-panel");
  return { default: loaded.RelationshipSharePanel };
});

export function RelationshipExperience({ locale, copy }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [insight, setInsight] = useState<RelationshipInsight | null>(null);
  const [outcomeContext, setOutcomeContext] = useState<NextAnalysisContext | null>(null);
  const [handoffError, setHandoffError] = useState("");
  const [error, setError] = useState("");
  const otherLocale = locale === "ko" ? "en" : "ko";

  useEffect(() => {
    if (outcomeContext) focusAndScroll("#relationship-outcome-context");
  }, [outcomeContext]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const [
        { calculateNumerologyProfile },
        { createRelationshipInsight },
      ] = await Promise.all([
        import("@/core/numerology"),
        import("@/core/relationship"),
      ]);
      const nextProfile = calculateNumerologyProfile({
        birthDate: String(form.get("birthDate") ?? ""),
        name: String(form.get("name") ?? ""),
        personalYear: new Date().getFullYear(),
      });
      setProfile(nextProfile);
      setInsight(createRelationshipInsight(nextProfile, locale));
      setOutcomeContext(null);
      setHandoffError("");
      focusAndScroll("#relationship-result");
    } catch {
      setProfile(null);
      setInsight(null);
      setError(copy.invalidDate);
    }
  }

  function reset() {
    setProfile(null);
    setInsight(null);
    setOutcomeContext(null);
    setHandoffError("");
    scrollToElement("#relationship-form");
  }

  async function continueContextInRealityCheck(contextId: MeetingContextId) {
    if (!insight) return;
    setHandoffError("");
    try {
      const [
        { createRelationshipRealityCheckDraft },
        { createRealityCheckHandoff, saveRealityCheckHandoff },
      ] = await Promise.all([
        import("@/core/relationship/handoff"),
        import("@/core/reality-check/handoff"),
      ]);
      const handoff = createRealityCheckHandoff(
        createRelationshipRealityCheckDraft({
          insight,
          contextId,
          locale,
          handoffId: `handoff:${crypto.randomUUID()}`,
        }),
        new Date().toISOString(),
      );
      saveRealityCheckHandoff(window.sessionStorage, handoff);
      router.push(`/${locale}/reality-check`);
    } catch {
      setHandoffError(copy.handoffUnavailable);
    }
  }

  async function applySavedOutcomes() {
    setError("");
    try {
      const [
        { createNextAnalysisContext },
        { loadRealityChecks },
      ] = await Promise.all([
        import("@/core/reality-check/engine"),
        import("@/core/reality-check/storage"),
      ]);
      const context = createNextAnalysisContext(
        loadRealityChecks(window.localStorage),
        "relationship",
        locale,
      );
      setOutcomeContext(context);
    } catch {
      setOutcomeContext(null);
      setError(copy.outcomeUnavailable);
    }
  }

  return (
    <>
      <main className="shell relationship-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong>
            <small>{copy.eyebrow}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/relationship`}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="relationship-intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.headline}</h1>
          <p>{copy.intro}</p>
          <Link className="compatibility-link" href={`/${locale}/compatibility`}>
            <strong>{copy.compareTwo}</strong>
            <span>{copy.compareIntro}</span>
          </Link>
        </section>

        <form className="relationship-form" id="relationship-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="relationship-birth-date">{copy.birthDate}</label>
            <input id="relationship-birth-date" name="birthDate" type="date" required />
            <small>{copy.birthHelp}</small>
          </div>
          <div className="field">
            <label htmlFor="relationship-name">{copy.name}</label>
            <input
              id="relationship-name"
              name="name"
              type="text"
              maxLength={200}
              placeholder={copy.namePlaceholder}
            />
            <small>{copy.nameHelp}</small>
          </div>
          <button className="primary-button" type="submit">{copy.submit}</button>
          {error && <p className="error" role="alert">{error}</p>}
          <p className="privacy-note">{copy.privacyNote}</p>
        </form>

        {insight && (
          <section className="relationship-result" id="relationship-result" aria-live="polite" tabIndex={-1}>
            <header className="relationship-summary">
              <p className="eyebrow">{copy.summary}</p>
              <h2>{insight.summary}</h2>
              <p className="profile-facts">
                Life Path {profile!.lifePath.value} · Attitude {profile!.attitude.value} ·
                Personal Year {profile!.personalYear.value}
              </p>
            </header>

            <section className="relationship-section">
              <h2>{copy.energySources}</h2>
              <div className="energy-list">
                {insight.energySources.map((source, index) => (
                  <article key={source}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{source}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="relationship-section meeting-contexts" id="meeting-contexts">
              <h2>{copy.meetingContexts}</h2>
              <p className="section-intro">{copy.meetingIntro}</p>
              <div className="meeting-grid">
                {insight.meetingContexts.map((context, index) => (
                  <article className="meeting-card" key={context.id}>
                    <span className="context-rank">{String(index + 1).padStart(2, "0")}</span>
                    <h3>{context.title}</h3>
                    <dl>
                      <div><dt>{copy.why}</dt><dd>{context.why}</dd></div>
                      <div><dt>{copy.tryThis}</dt><dd>{context.tryThis}</dd></div>
                      <div><dt>{copy.caution}</dt><dd>{context.caution}</dd></div>
                    </dl>
                    <button
                      className="secondary-button context-handoff"
                      type="button"
                      aria-label={`${copy.continueRealityCheck}: ${context.title}`}
                      onClick={() => continueContextInRealityCheck(context.id)}
                    >
                      {copy.continueRealityCheck}
                    </button>
                  </article>
                ))}
              </div>
              {handoffError && <p className="error" role="alert">{handoffError}</p>}
            </section>

            <section className="relationship-section partner-portrait">
              <p className="eyebrow">{copy.partnerPortrait}</p>
              <h2>{insight.futurePartnerPortrait.label}</h2>
              <p>{insight.futurePartnerPortrait.description}</p>
              <div className="quality-grid">
                {insight.futurePartnerPortrait.qualities.map((quality) => (
                  <article key={quality.key}>
                    <h3>{quality.label}</h3>
                    <p>{quality.why}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="relationship-two-column">
              <section className="relationship-section compact">
                <h2>{copy.attraction}</h2>
                <p>{insight.attractionPattern}</p>
              </section>
              <section className="relationship-section compact">
                <h2>{copy.friction}</h2>
                <p>{insight.frictionPattern}</p>
              </section>
            </div>

            <div className="relationship-two-column">
              <section className="relationship-section compact">
                <h2>{copy.greenFlags}</h2>
                <ul>{insight.greenFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul>
              </section>
              <section className="relationship-section compact">
                <h2>{copy.cycleLens}</h2>
                <p>{insight.currentCycleLens}</p>
              </section>
            </div>

            <section className="relationship-section reality-checks">
              <h2>{copy.realityChecks}</h2>
              <ol>{insight.realityChecks.map((check) => <li key={check}>{check}</li>)}</ol>
            </section>

            <section className="relationship-section outcome-bridge">
              <h2>{copy.outcomeBridgeTitle}</h2>
              <p>{copy.outcomeBridgeIntro}</p>
              <button className="secondary-button" type="button" onClick={applySavedOutcomes}>
                {copy.useSavedOutcomes}
              </button>
              <small>{copy.outcomePrivacy}</small>
            </section>

            {outcomeContext && (
              <section
                className={`relationship-outcome-context signal-${outcomeContext.signal}`}
                id="relationship-outcome-context"
                aria-live="polite"
                tabIndex={-1}
              >
                <p className="eyebrow">{copy.outcomeContextEyebrow}</p>
                <h2>{copy.outcomeSignals[outcomeContext.signal]}</h2>
                <p>{outcomeContext.guidance}</p>
                <dl className="outcome-counts">
                  <div><dt>{copy.reviewedOutcomes}</dt><dd>{outcomeContext.reviewedCount}</dd></div>
                  <div><dt>{copy.relevantOutcomes}</dt><dd>{outcomeContext.relevantCount}</dd></div>
                  <div><dt>{copy.uncertainOutcomes}</dt><dd>{outcomeContext.uncertainCount}</dd></div>
                  <div><dt>{copy.notRelevantOutcomes}</dt><dd>{outcomeContext.notRelevantCount}</dd></div>
                </dl>
                {outcomeContext.userLearnings.length > 0 && (
                  <div className="outcome-learnings">
                    <h3>{copy.savedLearnings}</h3>
                    <ul>
                      {outcomeContext.userLearnings.map((learning) => (
                        <li key={learning}>{learning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="disclaimer">{outcomeContext.uncertainty}</p>
                <small>{copy.contextRule}: {outcomeContext.contextVersion}</small>
              </section>
            )}

            <details>
              <summary>{copy.evidence}</summary>
              <div className="evidence-chips">
                {insight.evidenceRefs.map((ref) => <span key={ref.id}>{ref.label}</span>)}
              </div>
              <p className="rule-version">{insight.ruleVersion}</p>
            </details>

            <Suspense fallback={null}>
              <RelationshipSharePanel locale={locale} insight={insight} />
            </Suspense>

            <p className="disclaimer">{insight.uncertainty} {copy.disclaimer}</p>
            <button className="text-button" type="button" onClick={reset}>{copy.reset}</button>
          </section>
        )}
      </main>

      <nav className="bottom-nav relationship-nav" aria-label={locale === "ko" ? "주요 탐색" : "Primary navigation"}>
        {copy.nav.map((item, index) => {
          if (index === 0) return <Link href={`/${locale}`} key={item}>{item}</Link>;
          if (index === 1) return <Link href={`/${locale}/me`} prefetch={false} key={item}>{item}</Link>;
          if (index === 3) return <Link href={`/${locale}/question`} key={item}>{item}</Link>;
          if (index === 4) return <Link href={`/${locale}/reality-check`} key={item}>{item}</Link>;
          return <span className={index === 2 ? "active" : ""} key={item}>{item}</span>;
        })}
      </nav>
    </>
  );
}
