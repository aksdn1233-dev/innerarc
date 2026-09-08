"use client";
import { useSyncExternalStore, type ReactNode } from "react";
const subscribe = () => () => {};
/** Keep local-only personal forms inert until their submit handler is attached. */
export function HydrationGate({ children, locale }: { children: ReactNode; locale: string }) {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  return <><noscript><p role="status">{locale === "ko" ? "개인정보를 서버로 보내지 않고 계산하려면 JavaScript를 켜 주세요." : "Enable JavaScript to calculate locally without sending personal data to the server."}</p></noscript><fieldset className="hydration-gate" disabled={!ready} data-ready={ready}>{children}</fieldset></>;
}
