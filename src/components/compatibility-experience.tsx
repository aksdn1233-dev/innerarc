"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  createCompatibilityInsight,
  relationshipTypes,
  type CompatibilityInsight,
  type RelationshipType,
} from "@/core/compatibility";
import {
  calculateNumerologyProfile,
  NumerologyInputError,
  type NumerologyProfile,
} from "@/core/numerology";
import type { Locale } from "@/i18n/config";
import type { CompatibilityCopy } from "@/i18n/compatibility-copy";
import { buildCompatibilityShare } from "@/core/share";
import { ShareCardPanel } from "@/components/share-card-panel";
import { focusAndScroll, scrollToElement } from "@/components/accessibility";
import { WebtoonCue, WebtoonPanel } from "@/components/webtoon";
import { WebtoonReveal } from "@/components/webtoon-reveal";
import { HomeBar } from "@/components/home-bar";

type Props = { locale: Locale; copy: CompatibilityCopy };

export function CompatibilityExperience({ locale, copy }: Props) {
  const [profiles, setProfiles] = useState<{ a: NumerologyProfile; b: NumerologyProfile } | null>(null);
  const [insight, setInsight] = useState<CompatibilityInsight | null>(null);
  const [error, setError] = useState("");
  const otherLocale = locale === "ko" ? "en" : "ko";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("thirdPartyConsent") !== "on") {
      setProfiles(null);
      setInsight(null);
      setError(copy.invalid);
      return;
    }
    try {
      const personalYear = new Date().getFullYear();
      const a = calculateNumerologyProfile({
        birthDate: String(form.get("birthDateA") ?? ""),
        name: String(form.get("nameA") ?? ""),
        personalYear,
      });
      const b = calculateNumerologyProfile({
        birthDate: String(form.get("birthDateB") ?? ""),
        name: String(form.get("nameB") ?? ""),
        personalYear,
      });
      const relationshipType = String(form.get("relationshipType")) as RelationshipType;
      setProfiles({ a, b });
      setInsight(createCompatibilityInsight({ personA: a, personB: b, relationshipType, locale }));
      focusAndScroll("#compatibility-result");
    } catch (caught) {
      setProfiles(null);
      setInsight(null);
      setError(caught instanceof NumerologyInputError ? copy.invalid : copy.invalid);
    }
  }

  function reset() {
    setProfiles(null);
    setInsight(null);
    setError("");
    scrollToElement("#compatibility-form");
  }

  return (
    <>
      <main className="shell compatibility-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong>
            <small>{copy.brandTagline}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/compatibility`}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="compatibility-intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.headline}</h1>
          <p>{copy.intro}</p>
        </section>

        <form className="compatibility-form" id="compatibility-form" onSubmit={submit} noValidate>
          <div className="person-grid">
            <fieldset>
              <legend>{copy.personA}</legend>
              <div className="field">
                <label htmlFor="compatibility-birth-a">{copy.birthDate}</label>
                <input id="compatibility-birth-a" name="birthDateA" type="date" required />
              </div>
              <div className="field">
                <label htmlFor="compatibility-name-a">{copy.name}</label>
                <input id="compatibility-name-a" name="nameA" type="text" maxLength={200} placeholder={copy.namePlaceholder} />
              </div>
            </fieldset>
            <fieldset>
              <legend>{copy.personB}</legend>
              <div className="field">
                <label htmlFor="compatibility-birth-b">{copy.birthDate}</label>
                <input id="compatibility-birth-b" name="birthDateB" type="date" required />
              </div>
              <div className="field">
                <label htmlFor="compatibility-name-b">{copy.name}</label>
                <input id="compatibility-name-b" name="nameB" type="text" maxLength={200} placeholder={copy.namePlaceholder} />
              </div>
            </fieldset>
          </div>

          <div className="field compatibility-type">
            <label htmlFor="compatibility-type">{copy.relationshipType}</label>
            <select id="compatibility-type" name="relationshipType" defaultValue="romance">
              {relationshipTypes.map((type) => <option key={type} value={type}>{copy.types[type]}</option>)}
            </select>
          </div>

          <label className="check">
            <input type="checkbox" name="thirdPartyConsent" required />
            <span>{copy.thirdPartyConsent}</span>
          </label>
          <p className="privacy-note">{copy.privacyHelp}</p>
          <button className="primary-button" type="submit">{copy.submit}</button>
          {error && <span className="error compatibility-error" role="alert">{error}</span>}
        </form>

        {profiles && insight && (
          <section className="compatibility-result webtoon-flow" id="compatibility-result" aria-live="polite" tabIndex={-1}>
            <WebtoonReveal />

            <WebtoonPanel
              badge={`${copy.summary} · ${insight.relationshipLabel}`}
              title={insight.summary}
              tone="night"
            >
              {insight.roleOrderNote && <p className="webtoon-lead role-order-note">{insight.roleOrderNote}</p>}
              <div className="compatibility-facts" aria-label={copy.facts}>
                <span>A · Life Path {profiles.a.lifePath.value} · Attitude {profiles.a.attitude.value}</span>
                <span>B · Life Path {profiles.b.lifePath.value} · Attitude {profiles.b.attitude.value}</span>
              </div>
              <WebtoonCue />
            </WebtoonPanel>

            {/* One area per panel. The card grid put eight of these side by side and left the
                reader deciding which to open; in a column they simply arrive in order. */}
            {insight.sections.map((section, index) => (
              <WebtoonPanel
                badge={String(index + 1).padStart(2, "0")}
                className={`compatibility-card compatibility-${section.id}`}
                key={section.id}
                title={section.title}
                tone={index % 2 === 0 ? "paper" : "night"}
              >
                <p className="webtoon-body">{section.observation}</p>
                <div className="compatibility-conditions">
                  <strong>{copy.practicalConditions}</strong>
                  <ul>{section.practicalConditions.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="compatibility-check">
                  <strong>{copy.realityCheck}</strong>
                  <p>{section.realityCheck}</p>
                </div>
                <details>
                  <summary>{copy.evidence}</summary>
                  <div className="evidence-chips">{section.evidenceRefs.map((ref) => <span key={ref}>{ref}</span>)}</div>
                </details>
              </WebtoonPanel>
            ))}

            <section className="webtoon-panel webtoon-paper webtoon-outro" data-webtoon-panel="">
              <div className="webtoon-inner">
                <p className="disclaimer">{insight.uncertainty}</p>
                <p className="privacy-note">{insight.privacyNote}</p>
                <ShareCardPanel payload={buildCompatibilityShare({ locale, insight })} />
                <code className="rule-version">{copy.ruleVersion}: {insight.ruleVersion}</code>
                <button className="text-button" type="button" onClick={reset}>{copy.reset}</button>
              </div>
            </section>
          </section>
        )}
      </main>
      <HomeBar locale={locale} />
    </>
  );
}
