"use client";

import { useState } from "react";
import {
  ACQUISITION_SOURCES,
  acquisitionSourceLabels,
  type AcquisitionSource,
} from "@/core/acquisition-survey";
import type { Locale } from "@/i18n/config";

type Props = Readonly<{
  locale: Locale;
  orderId?: string;
  access?: string;
  proof?: string;
  ticket?: string;
  initialSource?: AcquisitionSource | null;
  preview?: boolean;
}>;

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

export function AcquisitionSurveyPanel({
  locale,
  orderId,
  access,
  proof,
  ticket,
  initialSource = null,
  preview = false,
}: Props) {
  const ko = locale === "ko";
  const [source, setSource] = useState<AcquisitionSource | null>(initialSource);
  const [detail, setDetail] = useState("");
  const [phase, setPhase] = useState<"open" | "sending" | "done">(initialSource ? "done" : "open");
  const [error, setError] = useState("");

  async function submit() {
    if (!source || (source === "other" && detail.trim().length < 2)) {
      setError(ko ? "한 가지를 선택해 주세요." : "Choose one option.");
      return;
    }
    if (preview) {
      setPhase("done");
      return;
    }
    if (!orderId) return;
    setPhase("sending");
    setError("");
    const response = await fetch("/api/surveys/acquisition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        ...(access ? { access } : {}),
        ...(proof ? { proof } : {}),
        ...(ticket ? { ticket } : {}),
        survey: { source, detail: detail.trim() },
      }),
    });
    if (!response.ok) {
      setPhase("open");
      setError(ko ? "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." : "Could not save. Try again shortly.");
      return;
    }
    setPhase("done");
  }

  return (
    <section className="acquisition-survey" aria-labelledby="acquisition-survey-title">
      <div className="acquisition-survey-glow" aria-hidden="true" />
      <header>
        <span>{phase === "done" ? "✓" : "1 / 1"}</span>
        <p>{ko ? "30초 설문" : "30-second survey"}</p>
        <h2 id="acquisition-survey-title">
          {phase === "done"
            ? (ko ? "답변이 저장되었습니다" : "Your answer is saved")
            : (ko ? "결을 어디에서 처음 알게 되셨나요?" : "Where did you first hear about GYEOL?")}
        </h2>
        <small>
          {phase === "done"
            ? (preview
                ? (ko ? "예시 화면에서는 서버에 저장하지 않습니다." : "The sample screen does not save to the server.")
                : (ko ? "더 나은 콘텐츠와 안내 경로를 만드는 데만 사용합니다." : "We use it only to improve content and discovery."))
            : (ko ? "연락처나 검색어는 받지 않습니다. 한 가지만 골라주세요." : "We do not collect contact details or search terms. Pick one.")}
        </small>
      </header>
      {phase !== "done" && (
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
              <input maxLength={80} onChange={(event) => setDetail(event.target.value)} value={detail} />
            </label>
          )}
          {error && <p className="field-error" role="alert">{error}</p>}
          <button className="acquisition-submit" disabled={!source || phase === "sending"} onClick={() => void submit()} type="button">
            {phase === "sending" ? (ko ? "저장 중…" : "Saving…") : (ko ? "선택 완료" : "Submit")}
          </button>
        </>
      )}
    </section>
  );
}
