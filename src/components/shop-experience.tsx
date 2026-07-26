import Link from "next/link";
import { createShopPreview } from "@/core/lifestyle";
import type { Locale } from "@/i18n/config";
import type { ShopCopy } from "@/i18n/shop-copy";

export function ShopExperience({ locale, copy }: { locale: Locale; copy: ShopCopy }) {
  const preview = createShopPreview(locale);
  const otherLocale = locale === "ko" ? "en" : "ko";

  return (
    <>
      <main className="shell shop-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>InnerArc</strong>
            <small>{copy.brandTagline}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/shop`}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="shop-intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.headline}</h1>
          <p>{copy.intro}</p>
          <span className="shop-status" role="status">{copy.status}</span>
        </section>

        <section className="shop-categories" aria-labelledby="shop-category-title">
          <header>
            <p className="eyebrow">01 — Categories</p>
            <h2 id="shop-category-title">{copy.categoriesTitle}</h2>
            <p>{copy.categoryIntro}</p>
          </header>
          <div className="shop-category-grid">
            {preview.categories.map((category, index) => (
              <article id={category.anchor} key={category.id}>
                <span className="shop-category-rank">0{index + 1}</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <strong aria-label={`${category.title}: ${copy.unavailable}`}>{copy.unavailable}</strong>
                <small>{category.disclosure}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="shop-gates">
          <div>
            <p className="eyebrow">02 — Release gate</p>
            <h2>{copy.launchGateTitle}</h2>
            <ul>{copy.launchGates.map((gate) => <li key={gate}>{gate}</li>)}</ul>
          </div>
          <aside>
            <h2>{copy.ethicsTitle}</h2>
            <p>{copy.ethics}</p>
            <Link href={`/${locale}#onboarding`}>{copy.backToResult}</Link>
          </aside>
        </section>
      </main>

      <nav className="bottom-nav" aria-label={locale === "ko" ? "주요 탐색" : "Primary navigation"}>
        {copy.nav.map((item, index) => {
          if (index === 0) return <Link href={`/${locale}`} key={item}>{item}</Link>;
          if (index === 1) return <Link href={`/${locale}/me`} prefetch={false} key={item}>{item}</Link>;
          if (index === 2) return <Link href={`/${locale}/relationship`} key={item}>{item}</Link>;
          if (index === 3) return <Link href={`/${locale}/question`} key={item}>{item}</Link>;
          return <Link href={`/${locale}/reality-check`} key={item}>{item}</Link>;
        })}
      </nav>
    </>
  );
}
