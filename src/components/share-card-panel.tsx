"use client";

import { renderShareCardSvg, type ShareCardPayload } from "@/core/share";

export function ShareCardPanel({ payload }: { payload: ShareCardPayload }) {
  const ko = payload.locale === "ko";

  function download() {
    const svg = renderShareCardSvg(payload);
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `innerarc-${payload.kind}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <details className="share-panel">
      <summary>{ko ? "개인정보 안전 공유 카드" : "Privacy-safe share card"}</summary>
      <div className="share-card-preview" data-share-kind={payload.kind}>
        <small>{payload.brand} · {payload.eyebrow}</small>
        <h3>{payload.title}</h3>
        <p>{payload.subtitle}</p>
        <ul>{payload.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
        <footer><span>{payload.contextLabel}</span><strong>{payload.footer}</strong></footer>
      </div>
      <p className="share-privacy-note">
        {ko
          ? "전체 생년월일·고민·질문·타인 이름 없이 이 기기에서 SVG를 만듭니다."
          : "Creates the SVG on this device without full birth dates, concerns, questions, or another person's name."}
      </p>
      <button className="primary-button" type="button" onClick={download}>
        {ko ? "SVG 다운로드" : "Download SVG"}
      </button>
    </details>
  );
}
