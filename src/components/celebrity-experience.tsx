"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import {
  celebrityFields,
  findCelebrityMatches,
  type CelebrityComparisonResult,
  type CelebrityField,
} from "@/core/celebrity";
import {
  calculateNumerologyProfile,
  NumerologyInputError,
  type NumerologyProfile,
} from "@/core/numerology";
import type { Locale } from "@/i18n/config";
import type { CelebrityCopy } from "@/i18n/celebrity-copy";
import { buildCelebrityMatchShare } from "@/core/share";
import { ShareCardPanel } from "@/components/share-card-panel";
import { focusAndScroll, scrollToElement } from "@/components/accessibility";
import { WebtoonReveal } from "@/components/webtoon-reveal";
import styles from "./success-pattern.module.css";
import { MINI_GUIDE_ASSETS } from "@/core/mini-guides";
import { createRealityCheckHandoff, saveRealityCheckHandoff } from "@/core/reality-check";

type Props = { locale: Locale; copy: CelebrityCopy };

export function CelebrityExperience({ locale, copy }: Props) {
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [comparison, setComparison] = useState<CelebrityComparisonResult | null>(null);
  const [error, setError] = useState("");
  const [handoffError, setHandoffError] = useState("");
  const otherLocale = locale === "ko" ? "en" : "ko";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const nextProfile = calculateNumerologyProfile({
        birthDate: String(form.get("birthDate") ?? ""),
        personalYear: new Date().getFullYear(),
      });
      const field = String(form.get("field") ?? "all") as CelebrityField | "all";
      setProfile(nextProfile);
      setComparison(findCelebrityMatches({ profile: nextProfile, locale, field, professionQuery: String(form.get("professionQuery") ?? ""), limit: 5 }));
      focusAndScroll("#celebrity-result");
    } catch (caught) {
      setProfile(null);
      setComparison(null);
      setError(caught instanceof NumerologyInputError ? copy.invalid : copy.invalid);
    }
  }

  function startRealityCheck() {
    const match = comparison?.matches[0];
    if (!match) return;
    setHandoffError("");
    try {
      const handoff = createRealityCheckHandoff({
        handoffId: `handoff:${crypto.randomUUID()}`,
        source: "success_story",
        locale,
        category: "work",
        storyId: match.celebrity.id,
        sourceRuleVersion: comparison!.ruleVersion,
        question: match.story.comparisonQuestion[locale],
        currentState: locale === "ko" ? "공개 인물의 결과가 아니라, 내 현재 조건에서 시험할 수 있는 행동을 고르는 중이다." : "I am choosing a behavior I can test under my current conditions rather than copying a public figure's result.",
        interpretation: `${match.story.publicPattern[locale]} ${match.story.unknowns.map(item => item[locale]).join(" ")}`,
        choice: locale === "ko" ? `적용 가능성: ${copy.transferabilityLabel[match.story.transferability]}` : `Transferability: ${copy.transferabilityLabel[match.story.transferability]}`,
        actionPlan: match.story.transferableAction[locale],
      }, new Date().toISOString());
      saveRealityCheckHandoff(window.sessionStorage, handoff);
      window.location.assign(`/${locale}/reality-check`);
    } catch {
      setHandoffError(copy.handoffUnavailable);
    }
  }

  function reset() {
    setProfile(null);
    setComparison(null);
    setError("");
    scrollToElement("#celebrity-form");
  }

  return (
    <>
      <main className="shell celebrity-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>태령당</strong>
            <small>{copy.brandTagline}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/celebrity`} prefetch={false}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="celebrity-intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.headline}</h1>
          <p>{copy.intro}</p>
        </section>

        <form className="celebrity-form" id="celebrity-form" onSubmit={submit} noValidate>
          <div className="celebrity-form-grid">
            <div className="field">
              <label htmlFor="celebrity-birth-date">{copy.birthDate}</label>
              <input id="celebrity-birth-date" name="birthDate" type="date" required />
            </div>
            <div className="field">
              <label htmlFor="celebrity-profession-query">{copy.professionSearch}</label>
              <input id="celebrity-profession-query" name="professionQuery" type="search" maxLength={80} autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="celebrity-field">{copy.field}</label>
              <select id="celebrity-field" name="field" defaultValue="all">
                <option value="all">{copy.allFields}</option>
                {celebrityFields.map((field) => <option value={field} key={field}>{copy.fields[field]}</option>)}
              </select>
            </div>
          </div>
          <button className="primary-button" type="submit">{copy.submit}</button>
          {error && <span className="error celebrity-error" role="alert">{error}</span>}
          <p className="privacy-note">{copy.privacyNote}</p>
        </form>

        {profile && comparison && (
          <section className="celebrity-result webtoon-flow webtoon-adapt" id="celebrity-result" aria-live="polite" tabIndex={-1}>
            <WebtoonReveal />
            <header>
              <p className="eyebrow">{copy.result}</p>
              <h2>{comparison.scopeLabel}</h2>
              <p className="profile-facts">Life Path {profile.lifePath.value} · Birthday {profile.birthday.value} · Attitude {profile.attitude.value}</p>
            </header>

            {!comparison.matches.length && <p className={styles.empty} role="status">{copy.noMatches}</p>}

            {comparison.matches[0] && <section className={styles.feature} aria-labelledby="celebrity-feature-title">
              <span className={styles.featureNumber}>01</span>
              <div>
                <p>{comparison.matches[0].celebrity.profession[locale]}</p>
                <h3 id="celebrity-feature-title">{comparison.matches[0].celebrity.displayName[locale]}</h3>
                <strong>{comparison.matches[0].tierLabel}</strong>
                <p>{comparison.matches[0].similarNote}</p>
              </div>
              <div className={styles.careerEvidence}>
                <span>{copy.careerEvidence}</span>
                {comparison.matches[0].celebrity.careerEvidence.map(item => <article key={`${comparison.matches[0].celebrity.id}-${item.date}`}>
                  <time dateTime={item.date}>{item.date}</time><p>{item.claim[locale]}</p>
                  <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.publisher} · {item.source.title}</a>
                </article>)}
              </div>
              <Image className={styles.guide} src={MINI_GUIDE_ASSETS.sahyeonSuccessPresent.path} alt="" width={220} height={220} sizes="(max-width: 720px) 132px, 220px" loading="lazy" />
            </section>}

            {comparison.matches[0] && <section className={styles.realityStory} aria-label={copy.publicPattern}>
              <article><span>{copy.publicPattern}</span><strong>{copy.evidenceStatus[comparison.matches[0].story.evidenceStatus]}</strong><p>{comparison.matches[0].story.publicPattern[locale]}</p></article>
              <article><span>{copy.hiddenConditions}</span><ul>{comparison.matches[0].story.hiddenConditions.map(item => <li key={item[locale]}>{item[locale]}</li>)}</ul></article>
              <article><span>{copy.unknowns}</span><ul>{comparison.matches[0].story.unknowns.map(item => <li key={item[locale]}>{item[locale]}</li>)}</ul></article>
              <article className={styles.transfer}><span>{copy.transferability}</span><strong>{copy.transferabilityLabel[comparison.matches[0].story.transferability]}</strong><p>{comparison.matches[0].story.transferableAction[locale]}</p><p><b>{copy.comparisonQuestion}</b><br />{comparison.matches[0].story.comparisonQuestion[locale]}</p><button className="primary-button" type="button" onClick={startRealityCheck}>{copy.realityCheck}</button>{handoffError && <small className="error" role="alert">{handoffError}</small>}</article>
              <details className={styles.storySources}><summary>{copy.source}</summary>{comparison.matches[0].story.sources.map(item => <a href={item.url} target="_blank" rel="noreferrer" key={item.url}>{item.publisher} · {item.title} · {copy.accessed}: {item.accessedAt}</a>)}</details>
            </section>}

            <section className={styles.boundary}>
              <article><span>02</span><h3>{copy.boundaryTitle}</h3><p>{copy.boundaryBody}</p></article>
              <article><span>03</span><h3>{copy.practicalTitle}</h3><p>{copy.practicalBody}</p></article>
            </section>

            <div className="celebrity-grid">
              {comparison.matches.map((match) => (
                <article className="celebrity-card" key={match.celebrity.id}>
                  <span className="celebrity-rank">{match.rank}</span>
                  <div className="celebrity-heading">
                    <p>{match.tierLabel}</p>
                    <h3>{match.celebrity.displayName[locale]}</h3>
                    <small>{match.celebrity.profession[locale]} · {match.celebrity.birthDate} · {copy.confidence[match.celebrity.confidence]}</small>
                  </div>
                  <dl>
                    <div><dt>{copy.shared}</dt><dd>{match.similarNote}</dd></div>
                    <div><dt>{copy.different}</dt><dd>{match.differentNote}</dd></div>
                  </dl>
                  <a href={match.celebrity.source.url} target="_blank" rel="noreferrer">
                    <strong>{copy.source}</strong>
                    <span>{match.celebrity.source.publisher} · {match.celebrity.source.title}</span>
                    <small>{copy.accessed}: {match.celebrity.source.accessedAt}</small>
                  </a>
                  <details>
                    <summary>{copy.evidence}</summary>
                    <div className="evidence-chips">{match.evidenceRefs.map((ref) => <span key={ref}>{ref}</span>)}</div>
                  </details>
                  <details>
                    <summary>{copy.careerEvidence}</summary>
                    {match.celebrity.careerEvidence.map(item => <p key={item.date}><time dateTime={item.date}>{item.date}</time> · {item.claim[locale]} <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.publisher}</a></p>)}
                  </details>
                </article>
              ))}
            </div>

            <section className="webtoon-outro">
              <p className="disclaimer">{comparison.uncertainty}</p>
              {comparison.matches[0] && (
                <ShareCardPanel payload={buildCelebrityMatchShare({ locale, match: comparison.matches[0] })} />
              )}
              <code className="rule-version">{copy.ruleVersion}: {comparison.ruleVersion}</code>
              <button className="text-button" type="button" onClick={reset}>{copy.reset}</button>
            </section>
          </section>
        )}
      </main>
    </>
  );
}
