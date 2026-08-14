"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  calculateNumerologyProfile,
  NumerologyInputError,
  type NumberCalculation,
  type NumerologyProfile,
} from "@/core/numerology";
import { createIntegratedProfile, getRuleBasedProfile } from "@/core/profile";
import { createLifestyleRecommendations } from "@/core/lifestyle";
import {
  createOnboardingReflectionContext,
  OnboardingContextInputError,
  type OnboardingReflectionContext,
} from "@/core/onboarding";
import { buildCoreProfileShare } from "@/core/share";
import { ShareCardPanel } from "@/components/share-card-panel";
import { focusAndScroll, scrollToElement } from "@/components/accessibility";
import { WebtoonReveal } from "@/components/webtoon-reveal";
import { MIN_BIRTH_DATE, currentMaxBirthDate, isAcceptedBirthDate } from "@/core/birth-range";
import { createPaidContentPreview } from "@/core/report-preview";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = { locale: Locale; dictionary: Dictionary };

function evidence(calculation: NumberCalculation): string {
  const reductions = calculation.steps.map((step) => step.output);
  return [`${calculation.expression} = ${calculation.initialTotal}`, ...reductions.map(String)].join(" → ");
}

export function OnboardingExperience({ locale, dictionary: d }: Props) {
  // Bounded here rather than in the module so a long-lived tab still refuses tomorrow.
  const maxBirthDate = currentMaxBirthDate();
  const [result, setResult] = useState<NumerologyProfile | null>(null);
  const [context, setContext] = useState<OnboardingReflectionContext | null>(null);
  const [error, setError] = useState("");
  const deepProfileRef = useRef<HTMLDetailsElement>(null);
  const guideVideoRef = useRef<HTMLVideoElement>(null);
  const guideAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const video = guideVideoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) {
      void guideAudioRef.current?.play().catch(() => {});
      return;
    }
    video.muted = false;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => {});
    });
  }, []);
  const profile = result ? getRuleBasedProfile(result.lifePath.value, locale) : null;
  const integratedProfile = result ? createIntegratedProfile(result, locale) : null;
  const lifestyle = result ? createLifestyleRecommendations(result, locale) : null;
  const paidPreview = result ? createPaidContentPreview(result, locale) : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("privacyRequired") !== "on") {
      setResult(null);
      setContext(null);
      setError(d.privacyRequired);
      return;
    }
    // `min`/`max` on the field are a convenience, not a guarantee — a form can be
    // submitted without them. 1994 with a dropped leading digit is a valid date and the
    // wrong millennium, and it used to be calculated straight through.
    const submittedBirthDate = String(form.get("birthDate") ?? "");
    if (!isAcceptedBirthDate(submittedBirthDate)) {
      setResult(null);
      setContext(null);
      setError(d.invalidDate);
      return;
    }
    try {
      const nextContext = createOnboardingReflectionContext({
        locale,
        focusId: String(form.get("interest") ?? ""),
        depth: String(form.get("depth") ?? ""),
        concern: String(form.get("concern") ?? ""),
        aiPersonalizationConsent: form.get("aiPersonalization") === "on",
      });
      const next = calculateNumerologyProfile({
        birthDate: String(form.get("birthDate") ?? ""),
        name: String(form.get("name") ?? ""),
        personalYear: new Date().getFullYear(),
      });
      setResult(next);
      setContext(nextContext);
      focusAndScroll("#result");
    } catch (caught) {
      setResult(null);
      setContext(null);
      setError(caught instanceof OnboardingContextInputError
        ? d.invalidContext
        : caught instanceof NumerologyInputError
          ? d.invalidDate
          : d.invalidDate);
    }
  }

  function openDeepProfile() {
    if (!deepProfileRef.current) return;
    deepProfileRef.current.open = true;
    focusAndScroll("#deep-profile");
  }

  function restart() {
    setResult(null);
    setContext(null);
    scrollToElement("#onboarding");
  }

  const otherLocale = locale === "ko" ? "en" : "ko";
  const labels = result
    ? [
        [d.lifePath, result.lifePath],
        [d.birthday, result.birthday],
        [d.attitude, result.attitude],
        [d.personalYear, result.personalYear],
      ] as const
    : [];

  return (
    <>
      <main className="shell profile-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong>
            <small>{d.brandTagline}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/profile`}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">{d.eyebrow}</p>
            <h1 id="hero-title">{d.headline}</h1>
            <p className="hero-copy">{d.intro}</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => scrollToElement("#onboarding")}
            >
              {d.start}
            </button>
          </div>
          <div className="hero-guide">
            <img
              alt=""
              aria-hidden="true"
              className="guide-clip guide-clip-fallback inline-video-fallback"
              fetchPriority="high"
              loading="eager"
              src="/videos/taeyul-guide-ios-smooth.webp?v=20260814-smooth1"
            />
            <video
              {...{ "webkit-playsinline": "true", "x-webkit-airplay": "deny" }}
              aria-hidden="true"
              className="guide-clip inline-video-source"
              controls={false}
              controlsList="nofullscreen noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              muted
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                video.setAttribute("playsinline", "");
                video.setAttribute("webkit-playsinline", "");
                video.controls = false;
                video.addEventListener("webkitbeginfullscreen", () => {
                  (video as HTMLVideoElement & { webkitExitFullscreen?: () => void })
                    .webkitExitFullscreen?.();
                }, { once: true });
              }}
              playsInline
              preload="auto"
              ref={guideVideoRef}
              tabIndex={-1}
            >
              <source src="/videos/taeyul-guide-smooth.mp4?v=20260814-smooth1" type="video/mp4" />
            </video>
            <audio autoPlay className="inline-video-audio" preload="auto" ref={guideAudioRef}>
              <source src="/videos/taeyul-guide-audio.m4a?v=20260810-ios1" type="audio/mp4" />
            </audio>
          </div>
        </section>

        <section className="form-section cinema-intake" id="onboarding" aria-labelledby="onboarding-title">
          <div className="cinema-intake-art" aria-hidden="true" />
          <form className="form-card" onSubmit={submit} noValidate>
            <p className="eyebrow">01 — {d.eyebrow}</p>
            <h2 id="onboarding-title">{d.start}</h2>

            <div className="field">
              <label htmlFor="birthDate">{d.birthDate}</label>
              <input id="birthDate" name="birthDate" type="date" max={maxBirthDate} min={MIN_BIRTH_DATE} required />
              <small>{d.birthHelp}</small>
            </div>

            <div className="field">
              <label htmlFor="name">{d.name}</label>
              <input id="name" name="name" type="text" maxLength={200} placeholder={d.namePlaceholder} />
              <small>{d.nameHelp}</small>
            </div>

            {/* A free taster asked for seven things before it would show anything. Only
                the birth date is needed to calculate, so everything that merely sharpens
                the result is folded away — still one click from open, not in the way of
                someone who came to see a number. */}
            <details className="optional-intake">
              <summary>{locale === "ko" ? "무엇이 궁금한지 알려주면 더 맞춰드려요 (선택)" : "Tell it what you want to know, and it fits closer (optional)"}</summary>
            <fieldset className="field">
              <legend>{d.interest}</legend>
              <div className="choice-row">
                {d.interests.map((option, index) => (
                  <label className="choice" key={option.value}>
                    <input
                      type="radio"
                      name="interest"
                      value={option.value}
                      defaultChecked={index === 0}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="concern">{d.concern}</label>
              <textarea
                id="concern"
                name="concern"
                maxLength={2_000}
                placeholder={d.concernPlaceholder}
                aria-describedby="concern-help"
              />
              <small id="concern-help">{d.questionBoundary}</small>
            </div>

            <fieldset className="field">
              <legend>{d.depth}</legend>
              <div className="choice-row">
                {d.depths.map((depth, index) => (
                  <label className="choice" key={depth.value}>
                    <input
                      type="radio"
                      name="depth"
                      value={depth.value}
                      defaultChecked={index === 1}
                    />
                    <span>{depth.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            </details>

            <label className="check">
              <input type="checkbox" name="privacyRequired" required />
              <span>{d.privacyRequired}</span>
            </label>
            <Link className="legal-inline-link" href={`/${locale}/privacy`}>
              {locale === "ko" ? "개인정보 처리 안내 읽기" : "Read the privacy information"}
            </Link>
            <label className="check">
              <input type="checkbox" name="aiPersonalization" />
              <span>{d.personalize}</span>
            </label>
            <p className="privacy-note">{d.aiConsentHelp}</p>

            <div className="form-actions">
              <button className="primary-button" type="submit">{d.calculate}</button>
              {error && <span className="error" role="alert">{error}</span>}
            </div>
            <p className="privacy-note">{d.privacyNote}</p>
            <p className="legal-note">
              <Link href={`/${locale}/terms`}>{locale === "ko" ? "출시 전 이용조건" : "Pre-release terms"}</Link>
            </p>
          </form>
        </section>

        {result && profile && integratedProfile && lifestyle && context && (
          <section className="result-section webtoon-flow" id="result" aria-live="polite" tabIndex={-1}>
            <WebtoonReveal />
            <article className="result-card webtoon-adapt">
              <header className="result-header">
                <p className="eyebrow">{d.resultEyebrow}</p>
                <p className="archetype">{d.archetype} · {profile.archetype}</p>
                <h2>{d.oneLine}</h2>
                <p className="summary">{profile.summary}</p>
              </header>

              <section className="onboarding-context-card" aria-labelledby="context-title">
                <p className="eyebrow">{d.contextEyebrow} · {context.focusLabel}</p>
                <h3 id="context-title">{context.title}</h3>
                <p>{context.contextualInference}</p>
                {context.concern && (
                  <div className="context-question">
                    <strong>{d.selectedQuestion}</strong>
                    <blockquote>{context.concern.text}</blockquote>
                    <small>{d.questionBoundary}</small>
                  </div>
                )}
                <dl>
                  <div>
                    <dt>{d.depth}</dt>
                    <dd><strong>{context.depthLabel}</strong> · {context.depthGuidance}</dd>
                  </div>
                  <div>
                    <dt>{d.smallAction}</dt>
                    <dd>{context.practicalAction}</dd>
                  </div>
                  <div>
                    <dt>{d.realityCheckLabel}</dt>
                    <dd>{context.realityCheck}</dd>
                  </div>
                </dl>
                <aside className="ai-boundary" aria-label={d.aiBoundaryTitle}>
                  <strong>{d.aiBoundaryTitle}</strong>
                  <span>{context.aiBoundary.message}</span>
                </aside>
                {context.nextStep.type === "deep_profile" ? (
                  <button className="secondary-button" type="button" onClick={openDeepProfile}>
                    {context.nextStep.label}
                  </button>
                ) : (
                  <Link
                    className="secondary-button context-next-link"
                    href={`/${locale}/${context.nextStep.type === "relationship" ? "relationship" : "reality-check"}`}
                  >
                    {context.nextStep.label}
                  </Link>
                )}
                <small className="context-uncertainty">{context.uncertainty}</small>
                <code className="rule-version">{d.ruleVersion}: {context.ruleVersion}</code>
              </section>

              {paidPreview && (
                <section className="paid-preview" aria-labelledby="paid-preview-title">
                  <p className="eyebrow">{locale === "ko" ? "실제 상세 리딩 미리보기" : "Real detailed-reading preview"}</p>
                  <h3 id="paid-preview-title">{paidPreview.unlockedSectionTitle}</h3>
                  <p>{paidPreview.visible}</p>
                  <div className="paid-preview-locks">
                    {paidPreview.lockedTopics.map((topic) => <span key={topic}>LOCKED · {topic}</span>)}
                  </div>
                  <Link className="primary-button" href={`/${locale}#onboarding`}>{locale === "ko" ? "상세 리딩 선택하기" : "Choose a detailed reading"}</Link>
                </section>
              )}

              <div className="number-grid">
                {labels.map(([label, calculation]) => (
                  <div className="number-tile" key={label}>
                    <strong>{calculation.value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <Link className="celebrity-result-link" href={`/${locale}/celebrity`}>
                <strong>{d.celebrityCompare}</strong>
                <span>{d.celebrityIntro}</span>
              </Link>

              <div className="insight-grid">
                <section className="insight">
                  <h3>{d.strengths}</h3>
                  <ul>{profile.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section className="insight">
                  <h3>{d.risks}</h3>
                  <ul>{profile.risks.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section className="insight">
                  <h3>{d.careers}</h3>
                  <p>{profile.careers}</p>
                </section>
                <section className="insight">
                  <h3>{d.relationship}</h3>
                  <p>{profile.relationship}</p>
                </section>
              </div>

              <div className="layer">
                <strong>{d.symbolicLabel}</strong>
                <p>{profile.symbolic}</p>
              </div>
              <div className="layer">
                <strong>{d.inferenceLabel}</strong>
                <p>{profile.inference}</p>
              </div>
              <div className="layer">
                <strong>{d.limitationLabel}</strong>
                <p>{profile.limitation}</p>
              </div>

              <details className="lifestyle-profile" id="lifestyle-recommendations">
                <summary>{d.lifestyleTitle}</summary>
                <p className="lifestyle-intro">{d.lifestyleIntro}</p>

                <section className="lifestyle-group">
                  <header className="lifestyle-group-heading">
                    <div>
                      <p className="eyebrow">Style reflection</p>
                      <h3>{d.accessoriesTitle}</h3>
                    </div>
                    <Link href={`/${locale}/shop`} className="shop-preview-link">
                      <strong>{d.shopPreview}</strong>
                      <span>{d.shopComingLater}</span>
                    </Link>
                  </header>
                  <div className="lifestyle-grid">
                    {lifestyle.accessories.map((item) => (
                      <article className="lifestyle-card accessory-card" key={item.categoryId}>
                        <span className="lifestyle-rank">0{item.rank}</span>
                        <p className="lifestyle-kicker">{item.categoryLabel}</p>
                        <h4>{item.title}</h4>
                        <dl>
                          <div><dt>{d.accessoryForm}</dt><dd>{item.form}</dd></div>
                          <div><dt>{d.accessoryPalette}</dt><dd>{item.palette}</dd></div>
                          <div><dt>{d.accessoryMaterial}</dt><dd>{item.materialDirection}</dd></div>
                          <div><dt>{d.accessoryRationale}</dt><dd>{item.symbolicRationale}</dd></div>
                          <div><dt>{d.accessoryTry}</dt><dd>{item.tryOnCue}</dd></div>
                          <div><dt>{d.accessorySafety}</dt><dd>{item.safetyAndCare}</dd></div>
                        </dl>
                        <Link href={`/${locale}/shop${item.shopAnchor}`}>
                          {d.shopComingLater}
                        </Link>
                        <small>{item.evidenceRefs.join(" · ")}</small>
                      </article>
                    ))}
                  </div>
                  <p className="lifestyle-safety">{lifestyle.accessorySafetyNote}</p>
                </section>

                <section className="lifestyle-group">
                  <header className="lifestyle-group-heading">
                    <div>
                      <p className="eyebrow">Listening reflection</p>
                      <h3>{d.musicTitle}</h3>
                    </div>
                  </header>
                  <div className="lifestyle-grid">
                    {lifestyle.music.map((item) => (
                      <article className="lifestyle-card music-card" key={item.laneId}>
                        <span className="lifestyle-rank">0{item.rank}</span>
                        <p className="lifestyle-kicker">{item.laneLabel}</p>
                        <h4>{item.title}</h4>
                        <dl>
                          <div><dt>{d.musicGenre}</dt><dd>{item.genreDirection}</dd></div>
                          <div><dt>{d.musicSonic}</dt><dd>{item.sonicTraits}</dd></div>
                          <div><dt>{d.musicUse}</dt><dd>{item.useContext}</dd></div>
                          <div><dt>{d.musicCue}</dt><dd>{item.selectionCue}</dd></div>
                          <div><dt>{d.musicRealityCheck}</dt><dd>{item.realityCheck}</dd></div>
                        </dl>
                        <small>{item.evidenceRefs.join(" · ")}</small>
                      </article>
                    ))}
                  </div>
                  <p className="lifestyle-safety">{lifestyle.musicSafetyNote}</p>
                </section>

                <p className="disclaimer">{lifestyle.uncertainty}</p>
                <code className="rule-version">{d.ruleVersion}: {lifestyle.ruleVersion}</code>
              </details>

              <details
                className="deep-profile"
                id="deep-profile"
                key={`${context.focusId}:${context.depth}`}
                ref={deepProfileRef}
                open={context.showDeepProfileByDefault}
              >
                <summary>{d.integratedProfile}</summary>
                <p className="deep-profile-intro">{d.integratedIntro}</p>
                <p className="summary">{integratedProfile.summary}</p>
                <div className="domain-grid">
                  {integratedProfile.domains.map((domain) => (
                    <article className="domain-card" key={domain.id}>
                      <h3>{domain.title}</h3>
                      <div className="domain-facts">
                        {domain.calculatedFacts.map((item) => <span key={item}>{item}</span>)}
                      </div>
                      <div><strong>{d.symbolicLabel}</strong><p>{domain.traditionalInterpretation}</p></div>
                      <div><strong>{d.inferenceLabel}</strong><p>{domain.personalizedInference}</p></div>
                      <div className="domain-check"><strong>{d.realityCheckLabel}</strong><p>{domain.realityCheck}</p></div>
                      <small>{domain.uncertainty}</small>
                    </article>
                  ))}
                </div>

                <section className="career-details">
                  <h3>{d.careerDetails}</h3>
                  <div className="career-grid">
                    {integratedProfile.careerRecommendations.map((role) => (
                      <article key={role.roleId}>
                        <span className="career-rank">{role.rank}</span>
                        <h4>{role.title}</h4>
                        <dl>
                          <div><dt>{d.fitReason}</dt><dd>{role.fitReason}</dd></div>
                          <div><dt>{d.adverseCondition}</dt><dd>{role.adverseCondition}</dd></div>
                          <div><dt>{d.complementarySkill}</dt><dd>{role.complementarySkill}</dd></div>
                          <div><dt>{d.preferredEnvironment}</dt><dd>{role.preferredEnvironment}</dd></div>
                          <div><dt>{d.avoidCondition}</dt><dd>{role.avoidCondition}</dd></div>
                        </dl>
                      </article>
                    ))}
                  </div>
                </section>

                <p className="disclaimer">{integratedProfile.uncertainty}</p>
                <code className="rule-version">{d.ruleVersion}: {integratedProfile.ruleVersion}</code>
              </details>

              <details>
                <summary>{d.evidence}</summary>
                {labels.map(([label, calculation]) => (
                  <div className="evidence-row" key={label}>
                    <span>{label}</span>
                    <code>{evidence(calculation)}</code>
                  </div>
                ))}
                {result.name.status === "calculated" ? (
                  <>
                    <div className="evidence-row"><span>Expression / Destiny</span><strong>{result.name.destiny?.value}</strong></div>
                    <div className="evidence-row"><span>Soul Urge</span><strong>{result.name.soulUrge?.value}</strong></div>
                    <div className="evidence-row"><span>Personality</span><strong>{result.name.personality?.value}</strong></div>
                  </>
                ) : (
                  <p>{d.nameUnavailable}</p>
                )}
                <p>{d.masterReason}</p>
              </details>

              <section className="webtoon-outro">
                <ShareCardPanel payload={buildCoreProfileShare({
                  locale,
                  lifePath: result.lifePath.value,
                  archetype: profile.archetype,
                  summary: profile.summary,
                  strengths: profile.strengths,
                })} />

                <p className="disclaimer">{d.disclaimer}</p>
                <button className="text-button" type="button" onClick={restart}>
                  {d.restart}
                </button>
              </section>
            </article>
          </section>
        )}
      </main>
    </>
  );
}
