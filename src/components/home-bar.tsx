import Link from "next/link";
import type { Locale } from "@/i18n/config";

/**
 * One way back, and nothing else.
 *
 * Every page used to carry the same five-item tab bar — 홈 · 나 · 관계 · 질문 · 성장 —
 * which asked a visitor to choose between five destinations at the exact moment they were
 * being asked to do one thing. A reader on the free reading needs one escape hatch, not a
 * map of the site; the pages that matter are reached from inside the flow they are in.
 *
 * Replacing the tab bar with a single link is also the only version that stays honest at
 * every width: five labels squeezed onto a 320px phone were unreadable long before they
 * were unhelpful.
 */
export function HomeBar({ locale }: { locale: Locale }) {
  return (
    <nav className="home-bar" aria-label={locale === "ko" ? "홈으로" : "Back to home"}>
      <Link href={`/${locale}`}>{locale === "ko" ? "홈" : "Home"}</Link>
    </nav>
  );
}
