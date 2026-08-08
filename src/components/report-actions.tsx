"use client";

export function ReportActions({
  downloadUrl,
  locale,
}: {
  downloadUrl: string;
  locale: "ko" | "en";
}) {
  return (
    <div className="report-actions">
      <a className="primary-button" href={downloadUrl}>
        {locale === "ko" ? "리포트 파일 내려받기" : "Download report"}
      </a>
      <button className="secondary-button" type="button" onClick={() => window.print()}>
        {locale === "ko" ? "인쇄·PDF로 저장" : "Print or save as PDF"}
      </button>
    </div>
  );
}
