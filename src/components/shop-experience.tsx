"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { currentMaxBirthDate, MIN_BIRTH_DATE } from "@/core/birth-range";
import { createShopPreview } from "@/core/lifestyle";
import {
  localizeAccessoryDirection,
  localizeAccessoryProduct,
  numerologyAccessoryDirections,
  sajuAccessoryDirections,
  accessoryConceptProducts,
  accessoryDetailBoards,
  recommendAccessoryProductsByBirthDate,
  type AccessoryBirthRecommendation,
} from "@/core/commerce/accessory-recommendations";
import type { Locale } from "@/i18n/config";
import type { ShopCopy } from "@/i18n/shop-copy";
import "./shop-refresh.css";

export function ShopExperience({ locale, copy }: { locale: Locale; copy: ShopCopy }) {
  const preview = createShopPreview(locale);
  const otherLocale = locale === "ko" ? "en" : "ko";
  const [mode, setMode] = useState<"saju" | "numerology">("saju");
  const [selectedIds, setSelectedIds] = useState({
    saju: sajuAccessoryDirections[0].id,
    numerology: numerologyAccessoryDirections[0].id,
  });
  const [birthDate, setBirthDate] = useState("");
  const [birthRecommendations, setBirthRecommendations] = useState<readonly AccessoryBirthRecommendation[]>([]);
  const [birthRecommendationError, setBirthRecommendationError] = useState("");
  const directions = mode === "saju" ? sajuAccessoryDirections : numerologyAccessoryDirections;
  const selectedDirection = directions.find(({ id }) => id === selectedIds[mode]) ?? directions[0];
  const selected = localizeAccessoryDirection(selectedDirection, locale);
  const allDirections = [...sajuAccessoryDirections, ...numerologyAccessoryDirections];

  function renderCatalogGroup(source: "saju" | "numerology", title: string) {
    const items = accessoryConceptProducts.filter((item) => item.source === source);
    return (
      <section className="shop-catalog-group" aria-labelledby={`${source}-catalog-title`}>
        <header>
          <h3 id={`${source}-catalog-title`}>{title}</h3>
          <span>{items.length}</span>
        </header>
        <div className="shop-product-grid">
          {items.map((product) => {
            const item = localizeAccessoryProduct(product, locale);
            const direction = allDirections.find(({ id }) => id === product.directionId);
            if (!direction) return null;
            const directionCopy = localizeAccessoryDirection(direction, locale);
            return (
              <article className="shop-product-card" key={product.id}>
                <div className="shop-product-image">
                  <Image
                    src={accessoryDetailBoards[product.directionId]}
                    alt={`${item.name} · ${copy.conceptBadge}`}
                    fill
                    loading="lazy"
                    sizes="(max-width: 720px) 100vw, (max-width: 980px) 50vw, 33vw"
                    style={{
                      width: "300%",
                      height: "300%",
                      maxWidth: "none",
                      left: `-${product.slot * 100}%`,
                      top: 0,
                    }}
                  />
                  <span>{copy.conceptBadge}</span>
                </div>
                <div className="shop-product-copy">
                  <p className="shop-product-meta"><span>{directionCopy.keyLabel}</span><span>{item.kind}</span></p>
                  <h4>{item.name}</h4>
                  <p className="shop-product-price"><small>{copy.priceLabel}</small><strong>{item.priceRange}</strong></p>
                  <dl>
                    <div><dt>{copy.productDescriptionLabel}</dt><dd>{item.description}</dd></div>
                    <div><dt>{copy.productDesignLabel}</dt><dd>{item.designDetails}</dd></div>
                    <div><dt>{copy.productUseLabel}</dt><dd>{item.useScene}</dd></div>
                    <div><dt>{copy.productCareLabel}</dt><dd>{item.careNote}</dd></div>
                  </dl>
                  <span className="shop-pending-purchase">{copy.pendingPurchase}</span>
                  <Link className="shop-detail-link" href={`/${locale}/shop/${product.id}`}>
                    {locale === "ko" ? "상품 상세보기" : "View product details"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  function selectMode(nextMode: "saju" | "numerology") {
    setMode(nextMode);
  }

  function selectDirection(id: string) {
    setSelectedIds((current) => ({ ...current, [mode]: id }));
  }

  function submitBirthRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const recommendations = recommendAccessoryProductsByBirthDate(birthDate, new Date().getFullYear());
      setBirthRecommendations(recommendations);
      setBirthRecommendationError("");
    } catch {
      setBirthRecommendations([]);
      setBirthRecommendationError(copy.recommendationError);
    }
  }

  return (
    <>
      <main className="shell shop-shell" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <Link className="brand" href={`/${locale}`}>
            <strong>태령당</strong>
            <small>{copy.brandTagline}</small>
          </Link>
          <Link className="locale-switch" href={`/${otherLocale}/shop`}>
            {otherLocale === "ko" ? "한국어" : "English"}
          </Link>
        </header>

        <section className="shop-intro">
          <div className="shop-intro-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.headline}</h1>
            <p>{copy.intro}</p>
            <span className="shop-status" role="status">{copy.status}</span>
          </div>
          <form className="shop-birth-recommender" onSubmit={submitBirthRecommendation}>
            <p className="eyebrow">{copy.recommendationEyebrow}</p>
            <h2>{copy.recommendationTitle}</h2>
            <p>{copy.recommendationIntro}</p>
            <label htmlFor="shop-birth-date">{copy.recommendationDateLabel}</label>
            <div>
              <input
                id="shop-birth-date"
                name="birthDate"
                type="date"
                min={MIN_BIRTH_DATE}
                max={currentMaxBirthDate()}
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                autoComplete="bday"
                aria-describedby="shop-birth-privacy shop-birth-error"
                required
              />
              <button type="submit">{copy.recommendationSubmit}</button>
            </div>
            <small id="shop-birth-privacy">{copy.recommendationPrivacy}</small>
            <span id="shop-birth-error" className="shop-birth-error" role="alert">{birthRecommendationError}</span>
          </form>
        </section>

        {birthRecommendations.length > 0 ? (
          <section className="shop-personal-edit" aria-live="polite" aria-labelledby="shop-personal-edit-title">
            <header>
              <div>
                <p className="eyebrow">CURATED FOR YOUR NUMBERS</p>
                <h2 id="shop-personal-edit-title">{copy.recommendationPrimary}</h2>
              </div>
              <p>{copy.recommendationBoundary}</p>
            </header>
            <div className="shop-personal-edit-grid">
              {birthRecommendations.map((recommendation, index) => {
                const item = localizeAccessoryProduct(recommendation.product, locale);
                return (
                  <article className={index === 0 ? "is-primary" : undefined} key={recommendation.fact}>
                    <div className="shop-personal-edit-image">
                      <Image
                        src={accessoryDetailBoards[recommendation.product.directionId]}
                        alt={`${item.name} · ${copy.conceptBadge}`}
                        fill
                        sizes="(max-width: 720px) 100vw, 33vw"
                        style={{
                          width: "300%",
                          height: "300%",
                          maxWidth: "none",
                          left: `-${recommendation.product.slot * 100}%`,
                          top: 0,
                        }}
                      />
                    </div>
                    <div className="shop-personal-edit-copy">
                      <p>{index === 0 ? copy.recommendationPrimary : copy.recommendationSupporting}</p>
                      <span>{copy.recommendationFactLabels[recommendation.fact]} {recommendation.value}</span>
                      <h3>{item.name}</h3>
                      <small>{item.kind} · {item.priceRange}</small>
                      <Link href={`/${locale}/shop/${recommendation.product.id}`}>
                        {locale === "ko" ? "추천 상품 상세보기" : "View recommended concept"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="shop-delivery-promise" aria-labelledby="shop-delivery-title">
          <div><p className="eyebrow">MADE TO ORDER · 30 DAYS</p><h2 id="shop-delivery-title">{copy.deliveryTitle}</h2></div>
          <div><p>{copy.deliveryBody}</p><small>{copy.deliveryBoundary}</small></div>
        </section>

        <section className="shop-vending-section" aria-labelledby="shop-vending-title">
          <header>
            <p className="eyebrow">RESULT-DRIVEN CONCEPT VENDING</p>
            <h2 id="shop-vending-title">{copy.vendingTitle}</h2>
            <p>{copy.vendingIntro}</p>
          </header>

          <div className="shop-mode-switch" aria-label={copy.variableLabel}>
            <button type="button" aria-pressed={mode === "saju"} onClick={() => selectMode("saju")}>{copy.sajuMode}</button>
            <button type="button" aria-pressed={mode === "numerology"} onClick={() => selectMode("numerology")}>{copy.numerologyMode}</button>
          </div>

          <div className="shop-vending-machine">
            <div className="shop-vending-controls">
              <strong>{copy.variableLabel}</strong>
              <div className="shop-variable-buttons">
                {directions.map((direction) => {
                  const item = localizeAccessoryDirection(direction, locale);
                  return (
                    <button
                      type="button"
                      aria-pressed={direction.id === selectedDirection.id}
                      onClick={() => selectDirection(direction.id)}
                      key={direction.id}
                    >
                      {item.keyLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <article className="shop-vending-result" aria-live="polite" key={selectedDirection.id}>
              <div className="shop-concept-image">
                <Image
                  src={selectedDirection.imageSrc}
                  alt={selected.imageAlt}
                  width={1000}
                  height={1000}
                  sizes="(max-width: 760px) 100vw, 52vw"
                />
                <span>{copy.conceptBadge}</span>
              </div>
              <div className="shop-vending-copy">
                <p className="shop-direction-key">{selected.keyLabel}</p>
                <h3>{selected.title}</h3>
                <p className="shop-market-price"><small>{copy.priceLabel}</small><strong>{selected.priceRange}</strong></p>
                <p className="shop-price-basis">{copy.priceBasis}</p>
                <dl>
                  <div><dt>{copy.formLabel}</dt><dd>{selected.form}</dd></div>
                  <div><dt>{copy.paletteLabel}</dt><dd>{selected.palette}</dd></div>
                  <div><dt>{copy.materialLabel}</dt><dd>{selected.material}</dd></div>
                  <div><dt>{copy.useLabel}</dt><dd>{selected.use}</dd></div>
                </dl>
                <p className="shop-concept-note">{copy.conceptNote}</p>
                <span className="shop-pending-purchase">{copy.pendingPurchase}</span>
              </div>
            </article>
          </div>

          <dl className="shop-order-terms">
            <div><dt>{copy.stockLabel}</dt><dd>{copy.stockValue}</dd></div>
            <div><dt>{copy.shippingLabel}</dt><dd>{copy.shippingValue}</dd></div>
            <div><dt>{copy.returnLabel}</dt><dd>{copy.returnValue}</dd></div>
          </dl>
        </section>

        <section className="shop-full-catalog" aria-labelledby="shop-full-catalog-title">
          <header>
            <div><p className="eyebrow">COMPLETE CONCEPT CATALOG</p><h2 id="shop-full-catalog-title">{copy.catalogTitle}</h2></div>
            <span>{copy.productCount}</span>
            <p>{copy.catalogIntro}</p>
          </header>
          {renderCatalogGroup("saju", copy.sajuCatalogTitle)}
          {renderCatalogGroup("numerology", copy.numerologyCatalogTitle)}
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
    </>
  );
}
