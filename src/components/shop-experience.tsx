import Link from "next/link";
import { HomeBar } from "@/components/home-bar";
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
            <strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong>
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
      <HomeBar locale={locale} />
    </>
  );
}
