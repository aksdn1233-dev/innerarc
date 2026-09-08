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
  const [speaking, setSpeaking] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const cachedText = useRef(guide.caption);
  useEffect(() => {
    cachedText.current = guide.caption;
    window.speechSynthesis?.cancel();
    return () => window.speechSynthesis?.cancel();
  }, [guide.caption]);

  function replay() {
    if (muted) return;
    const speech = window.speechSynthesis;
    if (!speech || typeof window.SpeechSynthesisUtterance === "undefined") {
      setUnavailable(true);
      setCaptions(true);
      return;
    }
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(cachedText.current);
    utterance.lang = ko ? "ko-KR" : "en-US";
    utterance.rate = 0.92;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); setUnavailable(true); setCaptions(true); };
    speech.speak(utterance);
  }

  return <aside className={styles.spaceGuide} data-anchor-object={guide.objectId ?? "room"} aria-label={ko ? "3D 공간 안내" : "3D space guide"}>
    <Image src={MINI_GUIDE_ASSETS.yundoSpaceExplain.path} alt="" width={180} height={180} sizes="(max-width: 540px) 112px, 180px" loading="lazy" />
    <div className={styles.guideBubble}>
      {captions && <p>{guide.caption}</p>}
      <details><summary>{ko ? "왜 이렇게 보나요?" : "Why this point?"}</summary><p>{guide.detail}</p></details>
      <div className={styles.guideControls}>
        <button type="button" aria-pressed={!muted} onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); setMuted(value => !value); }}>{muted ? (ko ? "음성 켜기" : "Unmute") : (ko ? "음소거" : "Mute")}</button>
        <button type="button" disabled={muted || speaking} onClick={replay}>{speaking ? (ko ? "읽는 중…" : "Speaking…") : (ko ? "다시 듣기" : "Replay")}</button>
        <button type="button" aria-pressed={captions} onClick={() => setCaptions(value => !value)}>{ko ? "자막" : "Captions"}</button>
      </div>
      {unavailable && <small role="status">{ko ? "이 기기의 음성을 사용할 수 없어 자막으로 계속 안내합니다." : "Device speech is unavailable; captions remain available."}</small>}
    </div>
  </aside>;
}
