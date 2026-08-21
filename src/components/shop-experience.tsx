"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createShopPreview } from "@/core/lifestyle";
import {
  localizeAccessoryDirection,
  numerologyAccessoryDirections,
  sajuAccessoryDirections,
} from "@/core/commerce/accessory-recommendations";
import type { Locale } from "@/i18n/config";
import type { ShopCopy } from "@/i18n/shop-copy";

export function ShopExperience({ locale, copy }: { locale: Locale; copy: ShopCopy }) {
  const preview = createShopPreview(locale);
  const otherLocale = locale === "ko" ? "en" : "ko";
  const [mode, setMode] = useState<"saju" | "numerology">("saju");
  const [selectedIds, setSelectedIds] = useState({
    saju: sajuAccessoryDirections[0].id,
    numerology: numerologyAccessoryDirections[0].id,
  });
  const directions = mode === "saju" ? sajuAccessoryDirections : numerologyAccessoryDirections;
  const selectedDirection = directions.find(({ id }) => id === selectedIds[mode]) ?? directions[0];
  const selected = localizeAccessoryDirection(selectedDirection, locale);

  function selectMode(nextMode: "saju" | "numerology") {
    setMode(nextMode);
  }

  function selectDirection(id: string) {
    setSelectedIds((current) => ({ ...current, [mode]: id }));
  }

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
