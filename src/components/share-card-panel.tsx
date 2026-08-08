"use client";

import { useRef, useState } from "react";
import { renderShareCardSvg, type ShareCardPayload } from "@/core/share";

export function ShareCardPanel({ payload }: { payload: ShareCardPayload }) {
  const ko = payload.locale === "ko";
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const operationInProgress = useRef(false);
  const filename = `innerarc-${payload.kind}`;
  const copy = ko
    ? {
        share: "이미지 공유",
        downloadPng: "PNG 다운로드",
        downloadSvg: "SVG 다운로드",
        preparing: "공유 이미지를 준비하고 있습니다.",
        shared: "선택한 공유 화면으로 이미지를 전달했습니다.",
        fallback: "이 기기에서는 파일 공유를 사용할 수 없어 PNG를 다운로드했습니다.",
        cancelled: "공유를 취소했습니다.",
        pngDownloaded: "PNG를 다운로드했습니다.",
        svgDownloaded: "SVG를 다운로드했습니다.",
        failed: "이미지를 만들지 못했습니다. 다시 시도해 주세요.",
        externalBoundary: "운영체제의 공유 화면에서 선택한 앱에는 해당 앱의 개인정보 처리방침이 적용됩니다.",
      }
    : {
        share: "Share image",
        downloadPng: "Download PNG",
        downloadSvg: "Download SVG",
        preparing: "Preparing the share image.",
        shared: "The image was handed to your selected share surface.",
        fallback: "File sharing is unavailable on this device, so the PNG was downloaded.",
        cancelled: "Sharing was cancelled.",
        pngDownloaded: "The PNG was downloaded.",
        svgDownloaded: "The SVG was downloaded.",
        failed: "The image could not be created. Please try again.",
        externalBoundary: "The privacy policy of the app you choose in the operating-system share surface will apply.",
      };

  function shareSvg(): string {
    return renderShareCardSvg(payload);
  }

  async function createPng(): Promise<Blob> {
    const { renderShareCardPng } = await import("@/components/share-card-file");
    return renderShareCardPng(shareSvg());
  }

  async function downloadFile(blob: Blob, extension: "png" | "svg") {
    const { downloadShareFile } = await import("@/components/share-card-file");
    downloadShareFile(blob, `${filename}.${extension}`);
  }

  function beginOperation(): boolean {
    if (operationInProgress.current) return false;
    operationInProgress.current = true;
    setBusy(true);
    setStatus(copy.preparing);
    return true;
  }

  function finishOperation(message: string) {
    operationInProgress.current = false;
    setBusy(false);
    setStatus(message);
  }

  async function shareImage() {
    if (!beginOperation()) return;
    try {
      const blob = await createPng();
      const file = new File([blob], `${filename}.png`, { type: "image/png" });
      const data: ShareData = { files: [file], title: "InnerArc" };
      let supportsFileShare = false;
      try {
        supportsFileShare =
          typeof navigator.share === "function"
          && typeof navigator.canShare === "function"
          && navigator.canShare({ files: [file] });
      } catch {
        supportsFileShare = false;
      }

      if (!supportsFileShare) {
        await downloadFile(blob, "png");
        finishOperation(copy.fallback);
        return;
      }

      try {
        await navigator.share(data);
        finishOperation(copy.shared);
      } catch (error) {
        const { isShareCancellation } = await import("@/components/share-card-file");
        if (isShareCancellation(error)) {
          finishOperation(copy.cancelled);
          return;
        }
        await downloadFile(blob, "png");
        finishOperation(copy.fallback);
      }
    } catch {
      finishOperation(copy.failed);
    }
  }

  async function downloadPng() {
    if (!beginOperation()) return;
    try {
      await downloadFile(await createPng(), "png");
      finishOperation(copy.pngDownloaded);
    } catch {
      finishOperation(copy.failed);
    }
  }

  async function downloadSvg() {
    if (!beginOperation()) return;
    try {
      await downloadFile(
        new Blob([shareSvg()], { type: "image/svg+xml;charset=utf-8" }),
        "svg",
      );
      finishOperation(copy.svgDownloaded);
    } catch {
      finishOperation(copy.failed);
    }
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
          ? "전체 생년월일·고민·질문·타인 이름 없이 이 기기에서 공유 이미지를 만듭니다."
          : "Creates the share image on this device without full birth dates, concerns, questions, or another person's name."}
      </p>
      <p className="share-external-note">{copy.externalBoundary}</p>
      <div className="share-actions">
        <button className="primary-button" type="button" onClick={shareImage} disabled={busy}>
          {copy.share}
        </button>
        <button type="button" onClick={downloadPng} disabled={busy}>{copy.downloadPng}</button>
        <button type="button" onClick={downloadSvg} disabled={busy}>{copy.downloadSvg}</button>
      </div>
      <p className="share-status" role="status" aria-live="polite">{status}</p>
    </details>
  );
}
