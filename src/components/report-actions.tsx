"use client";

export function ReportActions({
  downloadUrl,
  locale,
}: {
  downloadUrl: string;
  locale: "ko" | "en";
}) {
  function sendByEmail() {
    const subject = locale === "ko" ? "결 GYEOL 사주 원국" : "GYEOL Four Pillars chart";
    const body = locale === "ko"
      ? `결제한 사주 원국을 이 주소에서 다시 볼 수 있습니다.\n\n${window.location.href}`
      : `Open your purchased Four Pillars chart at this address.\n\n${window.location.href}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="report-actions">
      <a className="primary-button" href={downloadUrl}>
        {locale === "ko" ? "리포트 파일 내려받기" : "Download report"}
      </a>
      <button className="secondary-button" type="button" onClick={() => window.print()}>
        {locale === "ko" ? "인쇄·PDF로 저장" : "Print or save as PDF"}
      </button>
      <button className="secondary-button" type="button" onClick={sendByEmail}>
        {locale === "ko" ? "이메일로 받아보기" : "Keep by email"}
      </button>
    </div>
  );
}
