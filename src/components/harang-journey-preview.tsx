import Image from "next/image";
import "./harang-journey-preview.css";
import { HARANG_IMAGES } from "@/core/characters/harang";
import type { Locale } from "@/i18n/config";

/** A labelled example, rendered as text instead of obsolete screen recordings. */
export function HarangJourneyPreview({ locale, step }: { locale: Locale; step: number }) {
  const ko = locale === "ko";
  const labels = ko
    ? ["관심 분야를 골라요", "생년월일을 알려주세요", "무료 결과부터 읽어요", "원할 때 더 깊이 봐요"]
    : ["Choose your focus", "Add your birth date", "Read the free result", "Go deeper when you want"];
  return <div className="harang-journey-preview" role="group" aria-label={labels[step]}>
    <header><Image src={HARANG_IMAGES.face} alt="" width={64} height={64} unoptimized /><span>{ko ? "하랑 법사 · 이용 예시" : "Harang · example journey"}</span><small>{step + 1}/4</small></header>
    <h3>{labels[step]}</h3>
    {step === 0 && <ul>{(ko ? ["연애·관계", "일·진로", "돈·사업"] : ["Relationships", "Work", "Money"]).map(item => <li key={item}>{item}</li>)}</ul>}
    {step === 1 && <div><small>{ko ? "예시 생년월일" : "Sample birth date"}</small><strong>1994. 11. 04</strong><p>{ko ? "모르는 출생 시각은 비워둬요." : "An unknown birth time stays empty."}</p></div>}
    {step === 2 && <div><dl><div><dt>{ko ? "인생수" : "Life Path"}</dt><dd>11</dd></div><div><dt>{ko ? "생일수" : "Birthday"}</dt><dd>4</dd></div><div><dt>{ko ? "태도수" : "Attitude"}</dt><dd>6</dd></div></dl><p>{ko ? "계산 근거와 상징 해석을 함께 봐요." : "Read the calculation alongside the symbolic interpretation."}</p></div>}
    {step === 3 && <ol>{(ko ? ["내 강점과 반복되는 선택", "지금 바꿔볼 한 가지", "나중에 확인할 질문"] : ["Strengths and recurring choices", "One small action", "A question to revisit"]).map(item => <li key={item}>{item}</li>)}</ol>}
    <footer>{ko ? "예시 화면이에요. 내 결과는 입력한 정보에 따라 달라져요." : "Example only. Your result depends on your input."}</footer>
  </div>;
}
