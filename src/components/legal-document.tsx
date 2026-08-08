import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { LegalPageCopy } from "@/i18n/legal-copy";

export function LegalDocument({ locale, copy, kind }: { locale: Locale; copy: LegalPageCopy; kind: "privacy" | "terms" }) {
  const otherLocale = locale === "ko" ? "en" : "ko";
  return (
    <main className="shell legal-shell" id="main-content" tabIndex={-1}>
      <header className="topbar">
        <Link className="brand" href={`/${locale}`}>
          <strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong>
          <small>{copy.brandTagline}</small>
        </Link>
        <Link className="locale-switch" href={`/${otherLocale}/${kind}`}>
          {otherLocale === "ko" ? "한국어" : "English"}
        </Link>
      </header>

      <article className="legal-document">
        <p className="legal-status">{copy.status}</p>
        <h1>{copy.title}</h1>
        <p className="legal-intro">{copy.intro}</p>
        <p className="privacy-note">
          {locale === "ko" ? "최종 수정" : "Last updated"} · {copy.lastUpdated}
        </p>

        {copy.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
          </section>
        ))}

        <nav className="legal-links" aria-label={locale === "ko" ? "법률 안내" : "Legal information"}>
          <Link href={`/${locale}`}>{copy.home}</Link>
          <Link href={`/${locale}/privacy`}>{copy.privacy}</Link>
          <Link href={`/${locale}/terms`}>{copy.terms}</Link>
        </nav>
      </article>
    </main>
  );
}
