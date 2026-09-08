"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MINI_GUIDE_ASSETS } from "@/core/mini-guides";
import type { SpaceGuideNarration } from "@/core/space/narration";
import styles from "./space.module.css";

export function SpaceGuideNarration({ guide, locale }: { guide: SpaceGuideNarration; locale: "ko" | "en" }) {
  const ko = locale === "ko";
  const [muted, setMuted] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [speakingCaption, setSpeakingCaption] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const generation = useRef(0);
  const speaking = speakingCaption === guide.caption;
  function stop() {
    generation.current++;
    try { window.speechSynthesis?.cancel(); } catch { /* Text remains available. */ }
  }
  useEffect(() => {
    const counter = generation;
    return () => {
      counter.current++;
      setSpeakingCaption(null);
      try { window.speechSynthesis?.cancel(); } catch { /* Device speech is optional. */ }
    };
  }, [guide.caption]);

  function replay() {
    if (muted) return;
    stop();
    const ticket = generation.current;
    const fail = () => {
      if (ticket !== generation.current) return;
      setSpeakingCaption(null); setUnavailable(true); setCaptions(true);
    };
    try {
      const speech = window.speechSynthesis;
      if (!speech || typeof window.SpeechSynthesisUtterance === "undefined") { fail(); return; }
      const utterance = new SpeechSynthesisUtterance(guide.caption);
      utterance.lang = ko ? "ko-KR" : "en-US";
      utterance.rate = 0.92;
      setSpeakingCaption(guide.caption);
      setUnavailable(false);
      utterance.onend = () => { if (ticket === generation.current) setSpeakingCaption(null); };
      utterance.onerror = fail;
      speech.speak(utterance);
    } catch { fail(); }
  }

  return <aside className={styles.spaceGuide} data-anchor-object={guide.objectId ?? "room"} aria-label={ko ? "3D 공간 안내" : "3D space guide"}>
    {!imageFailed && <Image onError={() => setImageFailed(true)} src={MINI_GUIDE_ASSETS.yundoSpaceExplain.path} alt="" width={180} height={180} sizes="(max-width: 540px) 112px, 180px" loading="lazy" />}
    <div className={styles.guideBubble}><small>{guide.objectId ? "1 · " : ""}{ko ? "윤도 · 공간 안내" : "Yundo · Space guide"}</small>
      {captions && <p>{guide.caption}</p>}
      <details><summary>{ko ? "왜 이렇게 보나요?" : "Why this point?"}</summary><p>{guide.detail}</p></details>
      <div className={styles.guideControls}>
        <button type="button" aria-pressed={!muted} onClick={() => { stop(); setSpeakingCaption(null); setMuted(value => !value); }}>{muted ? (ko ? "음성 켜기" : "Unmute") : (ko ? "음소거" : "Mute")}</button>
        <button type="button" disabled={muted || speaking} onClick={replay}>{speaking ? (ko ? "읽는 중…" : "Speaking…") : (ko ? "다시 듣기" : "Replay")}</button>
        <button type="button" aria-pressed={captions} disabled={unavailable} onClick={() => setCaptions(value => !value)}>{ko ? "자막" : "Captions"}</button>
      </div>
      {unavailable && <small role="status">{ko ? "이 기기의 음성을 사용할 수 없어 자막으로 계속 안내합니다." : "Device speech is unavailable; captions remain available."}</small>}
    </div>
  </aside>;
}
