"use client";

import Link from "next/link";
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

type Props = { locale: Locale; copy: CelebrityCopy };

export function CelebrityExperience({ locale, copy }: Props) {
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [comparison, setComparison] = useState<CelebrityComparisonResult | null>(null);
  const [error, setError] = useState("");
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
      setComparison(findCelebrityMatches({ profile: nextProfile, locale, field, limit: 5 }));
      focusAndScroll("#celebrity-result");
    } catch (caught) {
      setProfile(null);
      setComparison(null);
      setError(caught instanceof NumerologyInputError ? copy.invalid : copy.invalid);
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
            <strong>InnerArc</strong>
            <small>{copy.brandTagline}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/celebrity`}>
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
          <section className="celebrity-result" id="celebrity-result" aria-live="polite" tabIndex={-1}>
            <header>
              <p className="eyebrow">{copy.result}</p>
              <h2>{comparison.scopeLabel}</h2>
              <p className="profile-facts">Life Path {profile.lifePath.value} · Birthday {profile.birthday.value} · Attitude {profile.attitude.value}</p>
            </header>

            <div className="celebrity-grid">
              {comparison.matches.map((match) => (
                <article className="celebrity-card" key={match.celebrity.id}>
                  <span className="celebrity-rank">{match.rank}</span>
                  <div className="celebrity-heading">
                    <p>{match.tierLabel}</p>
                    <h3>{match.celebrity.displayName[locale]}</h3>
                    <small>{match.celebrity.birthDate} · {copy.confidence[match.celebrity.confidence]}</small>
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
                </article>
              ))}
            </div>

            <p className="disclaimer">{comparison.uncertainty}</p>
            {comparison.matches[0] && (
              <ShareCardPanel payload={buildCelebrityMatchShare({ locale, match: comparison.matches[0] })} />
            )}
            <code className="rule-version">{copy.ruleVersion}: {comparison.ruleVersion}</code>
            <button className="text-button" type="button" onClick={reset}>{copy.reset}</button>
          </section>
        )}
      </main>

      <nav className="bottom-nav celebrity-nav" aria-label={locale === "ko" ? "주요 탐색" : "Primary navigation"}>
        {copy.nav.map((item, index) => {
          if (index === 0) return <Link href={`/${locale}`} key={item}>{item}</Link>;
          if (index === 1) return <Link href={`/${locale}/me`} prefetch={false} key={item}>{item}</Link>;
          if (index === 2) return <Link href={`/${locale}/relationship`} key={item}>{item}</Link>;
          if (index === 3) return <Link href={`/${locale}/question`} key={item}>{item}</Link>;
          if (index === 4) return <Link href={`/${locale}/reality-check`} key={item}>{item}</Link>;
          return <span className="active" key={item}>{item}</span>;
        })}
      </nav>
    </>
  );
}
