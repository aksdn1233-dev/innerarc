"use client";

import Link from "next/link";
import { useEffect } from "react";

// Without a boundary here, one failing route takes the whole locale segment down. This
// keeps the failure inside the route that caused it: the visitor can retry in place,
// and every other page stays reachable while a change is being worked on.
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Reaches the hosting platform's log without carrying anything the visitor typed.
    console.error("route_error", { digest: error.digest });
  }, [error.digest]);

  return (
    <main className="shell error-shell" id="main-content" tabIndex={-1}>
      <section className="error-card" role="alert">
        <p className="eyebrow">일시적인 오류 / Temporary error</p>
        <h1>이 화면을 불러오지 못했습니다</h1>
        <p>
          입력하신 생년월일과 고민 내용은 이 브라우저를 벗어나지 않았고, 결제도
          진행되지 않았습니다. 다시 시도하시거나 다른 메뉴로 이동해 주세요.
        </p>
        <p className="error-card-en">
          This screen failed to load. Nothing you entered left this browser and no payment
          was made. Please try again.
        </p>
        <div className="error-actions">
          <button className="primary-button" onClick={() => reset()} type="button">
            다시 시도 / Retry
          </button>
          <Link className="secondary-button" href="/ko">처음으로</Link>
          <Link className="secondary-button" href="/ko/orders">구매 내역 확인</Link>
        </div>
        {error.digest && <p className="error-digest">오류 코드 {error.digest}</p>}
      </section>
    </main>
  );
}
