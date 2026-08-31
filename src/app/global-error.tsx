"use client";

// Last-resort boundary. This one replaces the root layout, so it renders its own
// <html> and cannot rely on the application stylesheet being present. Without it a
// failure in the root layout leaves a visitor on a blank browser error page with no
// way back into a site that is otherwise healthy.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#0f1015",
          color: "#f4f2ee",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', 'Apple SD Gothic Neo', sans-serif",
          lineHeight: 1.6,
        }}
      >
        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <p style={{ letterSpacing: "0.12em", fontSize: "0.8rem", opacity: 0.7 }}>태령당</p>
          <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0 1rem" }}>
            화면을 불러오지 못했습니다
          </h1>
          <p style={{ opacity: 0.85 }}>
            일시적인 오류입니다. 입력하신 내용은 서버로 전송되지 않았습니다.
            다시 시도하거나 잠시 후 접속해 주세요.
          </p>
          <p style={{ opacity: 0.85 }}>
            This page could not be loaded. Nothing you entered was sent. Please try again.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => reset()}
              style={{
                background: "#f4f2ee",
                color: "#0f1015",
                border: "none",
                borderRadius: "999px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                cursor: "pointer",
              }}
              type="button"
            >
              다시 시도 / Retry
            </button>
            {/* A hard navigation on purpose: this boundary replaces the root layout,
                so the client router is exactly the thing that may have failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/ko"
              style={{
                border: "1px solid rgba(244,242,238,0.4)",
                borderRadius: "999px",
                padding: "0.75rem 1.5rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              처음으로 / Home
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", opacity: 0.5 }}>
              오류 코드 {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
