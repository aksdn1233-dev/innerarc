"use client";

import { useState, type FormEvent } from "react";
import {
  CHANGED_ACTIONS,
  isAllowedDisplayName,
  type ChangedAction,
  type OwnReviewState,
} from "@/core/reviews";
import type { Locale } from "@/i18n/config";
import { anonymousNamePresets, changedActionLabels, reviewCopy } from "@/i18n/review-copy";

type Props = Readonly<{
  locale: Locale;
  orderId: string;
  /** The same proof the reader used to open this report, carried into the write path. */
  access?: string;
  proof?: string;
  ticket?: string;
  existing: OwnReviewState | null;
}>;

type Phase = "collapsed" | "form" | "sending" | "done";

const STATUS_KEY = {
  pending: "statusPending",
  approved: "statusApproved",
  rejected: "statusRejected",
  withdrawn: "statusWithdrawn",
} as const;

export function ReviewRequestPanel({ locale, orderId, access, proof, ticket, existing }: Props) {
  const t = reviewCopy[locale];
  const [phase, setPhase] = useState<Phase>("collapsed");
  const [error, setError] = useState<string | null>(null);
  const [changedAction, setChangedAction] = useState<ChangedAction>("considering");
  const [publicConsent, setPublicConsent] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState<OwnReviewState | null>(existing);
  const [consentBusy, setConsentBusy] = useState(false);
  const [consentNote, setConsentNote] = useState<string | null>(null);

  const proofBody = {
    orderId,
    ...(access ? { access } : {}),
    ...(proof ? { proof } : {}),
    ...(ticket ? { ticket } : {}),
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const wantedToUnderstand = String(form.get("wantedToUnderstand") ?? "").trim();
    const mostUseful = String(form.get("mostUseful") ?? "").trim();
    const hardToUnderstand = String(form.get("hardToUnderstand") ?? "").trim();
    if (wantedToUnderstand.length < 5 || mostUseful.length < 5) {
      setError(t.invalid);
      return;
    }
    if (!isAllowedDisplayName(displayName)) {
      setError(t.nameInvalid);
      return;
    }

    setPhase("sending");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...proofBody,
          review: {
            wantedToUnderstand,
            mostUseful,
            hardToUnderstand,
            changedAction,
            publicConsent,
            displayName: displayName.trim(),
            hideProductContext: form.get("hideProductContext") === "on",
          },
        }),
      });
      if (!response.ok) throw new Error("review not accepted");
      setSaved({
        status: "pending",
        publicConsent,
        displayName: displayName.trim(),
        hideProductContext: form.get("hideProductContext") === "on",
        submittedAt: new Date().toISOString(),
      });
      setPhase("done");
    } catch {
      setError(t.failed);
      setPhase("form");
    }
  }

  async function changeConsent(next: boolean) {
    setConsentBusy(true);
    setConsentNote(null);
    try {
      const response = await fetch("/api/reviews/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...proofBody, publicConsent: next }),
      });
      if (!response.ok) throw new Error("consent change refused");
      setSaved((current) =>
        current
          ? { ...current, publicConsent: next, status: next ? "pending" : "withdrawn" }
          : current);
      setConsentNote(next ? t.restored : t.withdrawn);
    } catch {
      setConsentNote(t.failed);
    } finally {
      setConsentBusy(false);
    }
  }

  // Already reviewed — the panel becomes the reviewer's own consent control. This is
  // the only place they can take a published review back down, so it stays reachable
  // from the report they can always reopen.
  if (saved) {
    return (
      <section className="review-panel review-panel-saved" aria-labelledby="review-panel-title">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 id="review-panel-title">
          {phase === "done" ? t.doneTitle : t.alreadyTitle}
        </h2>
        <p className="review-status-line">
          <span className={`review-status is-${saved.status}`}>{t[STATUS_KEY[saved.status]]}</span>
          {saved.publicConsent ? t.donePublic : t.donePrivate}
        </p>
        <div className="review-consent-actions">
          <button
            className="secondary-button"
            disabled={consentBusy}
            onClick={() => void changeConsent(!saved.publicConsent)}
            type="button"
          >
            {saved.publicConsent ? t.withdraw : t.restore}
          </button>
          <span aria-live="polite">{consentNote ?? ""}</span>
        </div>
        <p className="review-privacy-note">{t.privacyNote}</p>
      </section>
    );
  }

  if (phase === "collapsed") {
    return (
      <section className="review-panel review-panel-invite" aria-labelledby="review-panel-title">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 id="review-panel-title">{t.title}</h2>
        <p>{t.intro}</p>
        <button className="secondary-button" onClick={() => setPhase("form")} type="button">
          {t.open}
        </button>
      </section>
    );
  }

  return (
    <section className="review-panel" aria-labelledby="review-panel-title">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 id="review-panel-title">{t.title}</h2>
      <p>{t.intro}</p>
      <form className="review-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="review-wanted">{t.wanted}</label>
          <textarea id="review-wanted" name="wantedToUnderstand" maxLength={600} rows={3} required />
          <small>{t.wantedHelp}</small>
        </div>
        <div className="field">
          <label htmlFor="review-useful">{t.useful}</label>
          <textarea id="review-useful" name="mostUseful" maxLength={600} rows={3} required />
          <small>{t.usefulHelp}</small>
        </div>
        <div className="field">
          <label htmlFor="review-hard">{t.hard}</label>
          <textarea id="review-hard" name="hardToUnderstand" maxLength={600} rows={2} />
          <small>{t.hardHelp}</small>
        </div>
        <fieldset className="field review-changed">
          <legend>{t.changed}</legend>
          <div className="choice-row">
            {CHANGED_ACTIONS.map((action) => (
              <label className="choice" key={action}>
                <input
                  checked={changedAction === action}
                  name="changedAction"
                  onChange={() => setChangedAction(action)}
                  type="radio"
                  value={action}
                />
                <span>{changedActionLabels[locale][action]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="review-consent">
          <legend>{t.consentTitle}</legend>
          <label className="check">
            <input
              checked={publicConsent}
              name="publicConsent"
              onChange={(event) => setPublicConsent(event.target.checked)}
              type="checkbox"
            />
            <span>{t.consentLabel}</span>
          </label>
          <small>{t.consentHelp}</small>

          {publicConsent && (
            <div className="review-consent-details">
              <div className="field">
                <label htmlFor="review-display-name">{t.displayName}</label>
                <input
                  id="review-display-name"
                  maxLength={16}
                  onChange={(event) => setDisplayName(event.target.value)}
                  type="text"
                  value={displayName}
                />
                <small>{t.displayNameHelp}</small>
                <div className="review-name-presets" role="group" aria-label={t.displayNamePreset}>
                  {anonymousNamePresets[locale].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setDisplayName(preset.value)}
                      type="button"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="check">
                <input name="hideProductContext" type="checkbox" />
                <span>{t.hideContext}</span>
              </label>
              <small>{t.hideContextHelp}</small>
            </div>
          )}
        </fieldset>

        <p className="review-privacy-note">{t.privacyNote}</p>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="primary-button" disabled={phase === "sending"} type="submit">
            {phase === "sending" ? t.sending : t.submit}
          </button>
          <button className="secondary-button" onClick={() => setPhase("collapsed")} type="button">
            {t.close}
          </button>
        </div>
      </form>
    </section>
  );
}
