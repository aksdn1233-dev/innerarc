"use client";

import Link from "next/link";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { readGuestReportLink } from "@/core/report-handoff";
import { captureConversionEvent } from "@/core/analytics";

const copy = {
  ko: {
    eyebrow: "결제 확인",
    movingTitle: "안전하게 리포트로 이동하고 있습니다.",
    movingBody: "자동으로 이동하지 않으면 아래 버튼을 눌러 주세요.",
    recoverTitle: "결제는 접수되었습니다. 리포트 주소를 확인해 주세요.",
    recoverBody:
      "이 브라우저에 저장된 리포트 주소를 찾지 못했습니다. 결제 화면에서 복사해 두신 주소로 바로 들어가실 수 있습니다. 가상계좌로 입금하신 경우에는 입금이 확인된 뒤에 리포트가 열립니다.",
    recoverSignedIn: "주문번호와 결제하신 휴대폰 번호가 있으면 아래에서 바로 찾으실 수 있어요.",
    orderNumber: "주문번호",
    orderNumberHelp: "문의하실 때 이 번호를 알려주시면 가장 빠릅니다.",
    myPage: "주문번호로 찾기",
    home: "홈으로",
  },
  en: {
    eyebrow: "Payment check",
    movingTitle: "Returning to your report.",
    movingBody: "If the page does not move automatically, use the button below.",
    recoverTitle: "Your payment was received. Please open your report address.",
    recoverBody:
      "This browser has no saved report address. Use the address you copied on the payment screen. If you paid to a virtual account, the report opens once the deposit is confirmed.",
    recoverSignedIn: "With your order number and the phone number used at checkout, you can find it below.",
    orderNumber: "Order number",
    orderNumberHelp: "Quote this number if you need to contact support.",
    myPage: "Find by order number",
    home: "Home",
  },
} as const;

// Local storage is an external store, so it is read through useSyncExternalStore
// rather than assigned into state from an effect. The snapshot is memoised per order
// because getSnapshot must be referentially stable. `undefined` means "not determined
// yet", which is what the server renders, so hydration does not flash the recovery
// view at a buyer whose link is present.
let snapshotCache: { orderId: string; value: string | null } | null = null;

function subscribeToStorage() {
  return () => {};
}

function readSnapshot(orderId: string): string | null {
  if (snapshotCache?.orderId === orderId) return snapshotCache.value;
  let value: string | null = null;
  try {
    value = readGuestReportLink(window.localStorage, {
      orderId,
      origin: window.location.origin,
      now: new Date(),
    });
  } catch {
    // Storage can be unavailable; fall through to the recovery view.
    value = null;
  }
  snapshotCache = { orderId, value };
  return value;
}

export function PayAppReturnClient({
  locale,
  orderId,
}: {
  locale: "ko" | "en";
  orderId: string;
}) {
  const t = copy[locale];
  const getSnapshot = useCallback(() => readSnapshot(orderId), [orderId]);
  const getServerSnapshot = useCallback(() => undefined, []);
  const reportUrl = useSyncExternalStore<string | null | undefined>(
    subscribeToStorage,
    getSnapshot,
    getServerSnapshot,
  );
  const resolved = reportUrl !== undefined;

  useEffect(() => {
    if (reportUrl) {
      captureConversionEvent("payment_success", locale, { provider: "payapp" });
      window.location.replace(reportUrl);
    }
  }, [locale, reportUrl]);

  // Never dead-end a buyer who has paid: without a stored link the page explains how
  // to recover instead of silently bouncing to a page that shows nothing.
  return (
    <main className="shell payment-result-shell" id="main-content">
      <section className="payment-result-card" aria-live="polite">
        <p className="eyebrow">{t.eyebrow}</p>
        {!resolved || reportUrl ? (
          <>
            <h1>{t.movingTitle}</h1>
            <p>{t.movingBody}</p>
            {reportUrl && (
              <a className="primary-button" href={reportUrl}>
                {locale === "ko" ? "리포트 열기" : "Open report"}
              </a>
            )}
          </>
        ) : (
          <>
            <h1>{t.recoverTitle}</h1>
            <p>{t.recoverBody}</p>
            <p>{t.recoverSignedIn}</p>
            <p className="report-link-order">
              {t.orderNumber} <code>{orderId}</code>
            </p>
            <p className="plans-notice">{t.orderNumberHelp}</p>
          </>
        )}
        <p className="payment-result-links">
          <Link className="link-button" href={`/${locale}/orders`}>
            {t.myPage}
          </Link>
          <Link className="link-button" href={`/${locale}`}>
            {t.home}
          </Link>
        </p>
      </section>
    </main>
  );
}
