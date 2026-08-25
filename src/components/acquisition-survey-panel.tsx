"use client";

import { useState } from "react";
import {
  ACQUISITION_SOURCES,
  FOLLOW_UP_INTERESTS,
  PREFERRED_CADENCES,
  RETURN_INTENTS,
  SATISFACTION_SCORES,
  AcquisitionSurveySchema,
  acquisitionSourceLabels,
  followUpInterestLabels,
  preferredCadenceLabels,
  returnIntentLabels,
  satisfactionLabels,
  type AcquisitionSource,
  type AcquisitionSurveyAnswers,
  type FollowUpInterest,
  type PreferredCadence,
  type ReturnIntent,
  type SatisfactionScore,
} from "@/core/acquisition-survey";
import type { Locale } from "@/i18n/config";

type Props = Readonly<{
  locale: Locale;
  orderId?: string;
  access?: string;
  proof?: string;
  ticket?: string;
  initialSurvey?: AcquisitionSurveyAnswers | null;
  preview?: boolean;
}>;

type Step = 1 | 2 | 3 | 4;

const sourceIcons: Record<AcquisitionSource, string> = {
  naver_search: "N",
  google_search: "G",
  instagram: "◎",
  youtube: "▶",
  other_sns: "#",
  online_ad: "AD",
  friend: "↗",
  community: "◌",
  other: "+",
};

function initialStep(survey?: AcquisitionSurveyAnswers | null): Step {
  if (!survey?.source) return 1;
  if (!survey.satisfactionScore || !survey.returnIntent) return 2;
  if (!survey.desiredFollowUp || !survey.preferredCadence) return 3;
  return 4;
}

function isComplete(survey?: AcquisitionSurveyAnswers | null): boolean {
  return Boolean(
    survey?.source &&
    survey.satisfactionScore &&
    survey.returnIntent &&
    survey.desiredFollowUp &&
    survey.preferredCadence,
  );
}

export function AcquisitionSurveyPanel({
  locale,
  orderId,
  access,
  proof,
  ticket,
  initialSurvey = null,
  preview = false,
}: Props) {
  const ko = locale === "ko";
  const [source, setSource] = useState<AcquisitionSource | null>(initialSurvey?.source ?? null);
  const [detail, setDetail] = useState(initialSurvey?.detail ?? "");
  const [satisfactionScore, setSatisfactionScore] = useState<SatisfactionScore | null>(initialSurvey?.satisfactionScore ?? null);
  const [returnIntent, setReturnIntent] = useState<ReturnIntent | null>(initialSurvey?.returnIntent ?? null);
  const [desiredFollowUp, setDesiredFollowUp] = useState<FollowUpInterest | null>(initialSurvey?.desiredFollowUp ?? null);
  const [preferredCadence, setPreferredCadence] = useState<PreferredCadence | null>(initialSurvey?.preferredCadence ?? null);
  const [step, setStep] = useState<Step>(initialStep(initialSurvey));
  const [phase, setPhase] = useState<"open" | "sending" | "done">(isComplete(initialSurvey) ? "done" : "open");
  const [error, setError] = useState("");

  const title = step === 1
    ? (ko ? "결을 어디에서 처음 알게 되셨나요?" : "Where did you first hear about GYEOL?")
    : step === 2
      ? (ko ? "이번 리포트는 얼마나 도움이 됐나요?" : "How useful was this report?")
      : step === 3
        ? (ko ? "다시 찾고 싶어지는 경험은 무엇인가요?" : "What would make you want to return?")
        : (ko ? "마지막으로 답변을 확인해 주세요" : "One last check before submitting");

  function move(next: Step) {
    if (step === 1 && (!source || (source === "other" && detail.trim().length < 2))) {
      setError(ko ? "유입 경로를 한 가지 선택해 주세요." : "Choose one discovery source.");
      return;
    }
    if (step === 2 && (!satisfactionScore || !returnIntent)) {
      setError(ko ? "두 질문에 모두 답해 주세요." : "Please answer both questions.");
      return;
    }
    if (step === 3 && (!desiredFollowUp || !preferredCadence)) {
      setError(ko ? "두 질문에 모두 답해 주세요." : "Please answer both questions.");
      return;
    }
    setError("");
    setStep(next);
  }

  async function submit() {
    const parsed = AcquisitionSurveySchema.safeParse({
      source,
      detail: detail.trim().replaceAll("|", ""),
      satisfactionScore,
      returnIntent,
      desiredFollowUp,
      preferredCadence,
    });
    if (!parsed.success) {
      setError(ko ? "빠진 답변이 있는지 확인해 주세요." : "Please check for a missing answer.");
      return;
    }
    if (preview) {
      setPhase("done");
      return;
    }
    if (!orderId) {
      setError(ko ? "설문을 저장할 수 없습니다." : "This survey cannot be saved.");
      return;
    }
    setPhase("sending");
    setError("");
    try {
      const response = await fetch("/api/surveys/acquisition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          ...(access ? { access } : {}),
          ...(proof ? { proof } : {}),
          ...(ticket ? { ticket } : {}),
          survey: parsed.data,
        }),
      });
      if (!response.ok) throw new Error("survey not accepted");
      setPhase("done");
    } catch {
      setPhase("open");
      setError(ko ? "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." : "Could not save. Try again shortly.");
    }
  }

  return (
    <section className="acquisition-survey" aria-labelledby="acquisition-survey-title">
      <div className="acquisition-survey-glow" aria-hidden="true" />
      <header>
        <span>{phase === "done" ? "✓" : `${step} / 4`}</span>
        <p>{ko ? "고객 경험 설문 · 약 1분" : "Experience survey · about 1 minute"}</p>
        <h2 id="acquisition-survey-title">
          {phase === "done"
            ? (ko ? "답변이 저장되었습니다" : "Your answers are saved")
            : title}
        </h2>
        <small>
          {phase === "done"
            ? (preview
                ? (ko ? "예시 화면에서는 서버에 저장하지 않습니다." : "The sample screen does not save to the server.")
                : (ko ? "다음 콘텐츠와 이용 경험을 개선하는 데만 사용합니다." : "We use this only to improve future content and the experience."))
            : step === 1
              ? (ko ? "연락처나 검색어는 받지 않습니다." : "We do not collect contact details or search terms.")
              : step === 3
                ? (ko ? "원하는 간격을 묻는 질문이며 실제 알림 설정은 바뀌지 않습니다." : "This asks about preference only and does not change notification settings.")
                : (ko ? "정답은 없습니다. 지금 느낀 그대로 골라주세요." : "There is no right answer. Choose what feels true now.")}
        </small>
      </header>

      {phase === "done" ? (
        <div className="acquisition-done-actions">
          <p>{ko ? "조금 더 자세한 이용 후기나 불편했던 점도 아래에서 남길 수 있습니다." : "You can also leave detailed feedback or note anything that felt difficult below."}</p>
          {!preview && <a className="acquisition-review-link" href="#review-panel">{ko ? "이용 후기 남기기" : "Leave detailed feedback"}</a>}
        </div>
      ) : (
        <>
          {step === 1 && (
            <>
              <div className="acquisition-choice-grid" role="radiogroup" aria-label={ko ? "유입 경로" : "Discovery source"}>
                {ACQUISITION_SOURCES.map((item) => (
                  <button
                    aria-checked={source === item}
                    className={source === item ? "is-selected" : ""}
                    disabled={phase === "sending"}
                    key={item}
                    onClick={() => { setSource(item); setError(""); }}
                    role="radio"
                    type="button"
                  >
                    <b aria-hidden="true">{sourceIcons[item]}</b>
                    <span>{acquisitionSourceLabels[locale][item]}</span>
                  </button>
                ))}
              </div>
              {source === "other" && (
                <label className="acquisition-detail">
                  <span>{ko ? "어디에서 보셨나요?" : "Where did you see us?"}</span>
                  <input maxLength={40} onChange={(event) => setDetail(event.target.value.replaceAll("|", ""))} value={detail} />
                </label>
              )}
            </>
          )}

          {step === 2 && (
            <div className="acquisition-question-stack">
              <fieldset className="acquisition-question">
                <legend>{ko ? "1. 리포트가 나를 돌아보는 데 얼마나 도움이 됐나요?" : "1. How much did the report help you reflect?"}</legend>
                <div className="acquisition-score-grid" role="radiogroup">
                  {SATISFACTION_SCORES.map((score) => (
                    <button aria-checked={satisfactionScore === score} className={satisfactionScore === score ? "is-selected" : ""} key={score} onClick={() => setSatisfactionScore(score)} role="radio" type="button">
                      <b>{score}</b><span>{satisfactionLabels[locale][score]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="acquisition-question">
                <legend>{ko ? "2. 필요한 순간에 결을 다시 이용할 의향이 있나요?" : "2. Would you use GYEOL again when you need it?"}</legend>
                <div className="acquisition-choice-grid is-compact" role="radiogroup">
                  {RETURN_INTENTS.map((intent) => (
                    <button aria-checked={returnIntent === intent} className={returnIntent === intent ? "is-selected" : ""} key={intent} onClick={() => setReturnIntent(intent)} role="radio" type="button">
                      <span>{returnIntentLabels[locale][intent]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="acquisition-question-stack">
              <fieldset className="acquisition-question">
                <legend>{ko ? "1. 다음에 가장 보고 싶은 것은 무엇인가요?" : "1. What would you most like to see next?"}</legend>
                <div className="acquisition-choice-grid is-compact" role="radiogroup">
                  {FOLLOW_UP_INTERESTS.map((interest) => (
                    <button aria-checked={desiredFollowUp === interest} className={desiredFollowUp === interest ? "is-selected" : ""} key={interest} onClick={() => setDesiredFollowUp(interest)} role="radio" type="button">
                      <span>{followUpInterestLabels[locale][interest]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="acquisition-question">
                <legend>{ko ? "2. 어느 정도 간격이면 부담 없이 다시 보고 싶나요?" : "2. What rhythm would feel comfortable?"}</legend>
                <div className="acquisition-choice-grid is-compact" role="radiogroup">
                  {PREFERRED_CADENCES.map((cadence) => (
                    <button aria-checked={preferredCadence === cadence} className={preferredCadence === cadence ? "is-selected" : ""} key={cadence} onClick={() => setPreferredCadence(cadence)} role="radio" type="button">
                      <span>{preferredCadenceLabels[locale][cadence]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 4 && source && satisfactionScore && returnIntent && desiredFollowUp && preferredCadence && (
            <dl className="acquisition-summary">
              <div><dt>{ko ? "처음 알게 된 경로" : "Discovery"}</dt><dd>{acquisitionSourceLabels[locale][source]}</dd></div>
              <div><dt>{ko ? "도움 정도" : "Usefulness"}</dt><dd>{satisfactionScore} · {satisfactionLabels[locale][satisfactionScore]}</dd></div>
              <div><dt>{ko ? "재이용 의향" : "Return intent"}</dt><dd>{returnIntentLabels[locale][returnIntent]}</dd></div>
              <div><dt>{ko ? "원하는 후속 경험" : "Desired follow-up"}</dt><dd>{followUpInterestLabels[locale][desiredFollowUp]}</dd></div>
              <div><dt>{ko ? "부담 없는 간격" : "Preferred rhythm"}</dt><dd>{preferredCadenceLabels[locale][preferredCadence]}</dd></div>
            </dl>
          )}

          {error && <p className="field-error" role="alert">{error}</p>}
          <div className="acquisition-actions">
            {step > 1 && <button className="acquisition-back" disabled={phase === "sending"} onClick={() => move((step - 1) as Step)} type="button">{ko ? "이전" : "Back"}</button>}
            {step < 4 ? (
              <button className="acquisition-submit" onClick={() => move((step + 1) as Step)} type="button">{ko ? "다음" : "Next"}</button>
            ) : (
              <button className="acquisition-submit" disabled={phase === "sending"} onClick={() => void submit()} type="button">
                {phase === "sending" ? (ko ? "저장 중…" : "Saving…") : (ko ? "설문 제출하기" : "Submit survey")}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
