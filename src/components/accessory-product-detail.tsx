"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  accessoryConceptProducts,
  accessoryDetailBoards,
  getAccessoryDirection,
  localizeAccessoryDirection,
  localizeAccessoryProduct,
  type AccessoryConceptProduct,
} from "@/core/commerce/accessory-recommendations";
import type { Locale } from "@/i18n/config";
import { shopCopy } from "@/i18n/shop-copy";
import "./accessory-product-detail.css";

const detailCopy = {
  ko: {
    shop: "악세서리 상점",
    concept: "자동 생성 상품 콘셉트 상세",
    price: "시세 참고 예상 제작가",
    unavailable: "현재는 콘셉트 검토 단계이며 결제할 수 없습니다",
    galleryTitle: "여러 시점에서 형태 확인하기",
    galleryBody: "정면만으로 판단하기 어려운 두께·연결부·뒷면 구조를 함께 비교해 보세요.",
    zoomHint: "이미지를 눌러 크게 보기",
    zoomTitle: "상품 콘셉트 확대 보기",
    zoomIn: "확대",
    zoomOut: "축소",
    zoomReset: "원래 크기",
    zoomClose: "확대 보기 닫기",
    views: ["정면 콘셉트", "사선 콘셉트", "측면·뒷면 구조 콘셉트"],
    viewDescriptions: ["전체 비율과 중심 장식을 확인하는 시점", "곡면과 입체감을 확인하는 시점", "두께·잠금·연결 구조를 확인하는 시점"],
    overview: "상품 콘셉트 설명",
    design: "디자인·제작 방향",
    use: "추천 사용 장면",
    care: "관리·확인사항",
    choosingTitle: "이 상품을 선택하기 전에",
    choosingIntro: "예쁜지뿐 아니라 실제 생활에서 자주 쓸 수 있는지 아래 기준으로 비교해 보세요.",
    fit: "이런 사용을 원할 때 먼저 보기",
    compare: "다른 후보와 비교할 기준",
    confirm: "제작 확정 전에 확인할 것",
    conceptNoticeTitle: "이미지와 실제 제작품의 차이",
    conceptNotice: "화면의 이미지는 형태 선택을 돕기 위한 자동 생성 콘셉트입니다. 실제 판매품 사진이 아니며, 소재·색·치수·마감·잠금 구조는 실물 샘플과 고지 검토 후 달라질 수 있습니다. 실물과 일치하는 사진이 준비되기 전에는 결제를 열지 않습니다.",
    related: "같은 결과 계열의 다른 후보",
    back: "전체 상품으로 돌아가기",
    detail: "상세보기",
    orderTitle: "주문 제작 전제",
    orderBody: "승인된 상품이 결제로 열리는 경우에도 완제품 재고가 아닌 1:1 주문 제작이며, 결제 확인 후 30일 이내 발송을 목표로 합니다. 배송비는 실제 운임 착불이고, 법정 하자·오배송·계약 불일치 권리는 제한하지 않습니다.",
  },
  en: {
    shop: "Accessory shop",
    concept: "Generated product-concept detail",
    price: "Indicative market-based range",
    unavailable: "Concept review only · purchasing is not available",
    galleryTitle: "Review the form from multiple viewpoints",
    galleryBody: "Compare thickness, findings, and back construction that a front view alone cannot show.",
    zoomHint: "Select an image to enlarge",
    zoomTitle: "Enlarged product concept",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    zoomReset: "Reset zoom",
    zoomClose: "Close enlarged view",
    views: ["Front concept", "Three-quarter concept", "Side or back construction concept"],
    viewDescriptions: ["Review overall proportion and the focal element", "Review curvature and volume", "Review thickness, closure, and connection structure"],
    overview: "Product concept",
    design: "Design and production direction",
    use: "Suggested use",
    care: "Care and checks",
    choosingTitle: "Before choosing this concept",
    choosingIntro: "Compare whether it fits ordinary use—not only whether it looks appealing.",
    fit: "Review first when you want",
    compare: "Compare against other candidates",
    confirm: "Confirm before production approval",
    conceptNoticeTitle: "Concept image versus a produced item",
    conceptNotice: "These are generated concepts intended to help with form selection. They are not photographs of a delivered item. Material, color, dimensions, finish, closure, and construction may change after physical sampling and disclosure review. Checkout stays closed until matching real-item photographs are ready.",
    related: "Other candidates in the same result family",
    back: "Back to all products",
    detail: "View details",
    orderTitle: "Made-to-order boundary",
    orderBody: "If an approved item later opens for checkout, it will be made one-to-one rather than drawn from finished inventory, with shipment targeted within 30 days after verified payment. Shipping is charged by the carrier on delivery, and statutory remedies for defects, wrong delivery, or contract mismatch remain available.",
  },
} as const;

function choosingGuidance(kind: string, locale: Locale) {
  const ko = locale === "ko";
  if (/팔찌|Bracelet/i.test(kind)) return {
    fit: ko ? "손목에 가볍게 반복 착용할 포인트를 찾을 때" : "a repeat-wear wrist accent",
    compare: ko ? "손목 둘레, 주로 쓰는 손, 시계와의 간섭, 잠금 방식" : "wrist size, dominant hand, watch interference, and closure",
    confirm: ko ? "피부 접촉 소재, 총중량, 모서리, 땀·물에 대한 관리법" : "skin-contact materials, total weight, edges, and sweat or water care",
  };
  if (/펜던트|Pendant/i.test(kind)) return {
    fit: ko ? "단색 상의 위에 중심 장식 하나를 두고 싶을 때" : "one central accent over a solid top",
    compare: ko ? "체인 길이, 장식 크기, 목 피부 민감도, 옷깃과의 위치" : "chain length, ornament size, skin sensitivity, and neckline position",
    confirm: ko ? "체인 도금, 금속 알레르기, 총중량, 장식의 앞뒤 마감" : "chain plating, metal allergy, total weight, and front/back finish",
  };
  if (/브로치|Brooch/i.test(kind)) return {
    fit: ko ? "재킷·코트·가방의 단단한 면에 포인트를 둘 때" : "a focal point on a firm jacket, coat, or bag surface",
    compare: ko ? "핀 위치, 의류 두께, 장식 무게, 걸림 가능성" : "pin position, fabric thickness, ornament weight, and snag risk",
    confirm: ko ? "핀 잠금력, 날카로운 모서리, 의류 손상 가능성, 보관 방식" : "pin security, sharp edges, fabric damage risk, and storage",
  };
  if (/트레이|Tray/i.test(kind)) return {
    fit: ko ? "현관·침대 옆·책상의 작은 물건을 한곳에 둘 때" : "organizing small objects by an entry, bed, or desk",
    compare: ko ? "놓을 공간의 실제 폭, 테두리 높이, 바닥 미끄럼, 세척 방식" : "available surface size, rim height, base grip, and cleaning method",
    confirm: ko ? "식품용 여부, 표면 코팅, 물 고임, 뜨거운 물건 사용 제한" : "food-safety status, coating, standing water, and heat restrictions",
  };
  if (/스트랩|Strap/i.test(kind)) return {
    fit: ko ? "파우치나 작은 가방에 보조 손잡이를 더할 때" : "an auxiliary handle for a pouch or small bag",
    compare: ko ? "손목 폭, 전체 길이, 고리 규격, 예상 하중" : "wrist width, total length, hook size, and expected load",
    confirm: ko ? "봉제 강도, 고리 내구성, 주 손잡이 사용 제한, 오염 관리" : "stitch strength, hook durability, load limits, and cleaning",
  };
  if (/북마크|Bookmark/i.test(kind)) return {
    fit: ko ? "책이나 다이어리의 현재 위치를 얇은 장식으로 표시할 때" : "a slim place marker for a book or journal",
    compare: ko ? "판 두께, 모서리, 태슬 길이, 종이에 남는 압력" : "plate thickness, corners, tassel length, and page pressure",
    confirm: ko ? "종이 긁힘, 도금·표면 이염, 습기 관리, 장기 끼움 가능성" : "page scratching, color transfer, moisture, and long-term insertion",
  };
  return {
    fit: ko ? "열쇠·파우치·가방에 작은 휴대 장식을 더할 때" : "a small carry accent for keys, a pouch, or a bag",
    compare: ko ? "고리 규격, 장식 길이, 무게, 다른 물건과의 걸림" : "ring size, ornament length, weight, and snagging",
    confirm: ko ? "연결부 강도, 표면 코팅, 고열·마찰 환경, 개인정보 노출 여부" : "link strength, coating, heat or friction exposure, and privacy exposure",
  };
}

type SpriteStyle = CSSProperties & {
  "--sprite-x": string;
  "--sprite-y": string;
};

function frameStyle(slot: number, row: number): SpriteStyle {
  return {
    "--sprite-x": `${slot * -100}%`,
    "--sprite-y": `${row * -100}%`,
  };
}

function ProductConceptImage({
  board,
  slot,
  row,
  alt,
  priority = false,
}: {
  board: string;
  slot: number;
  row: number;
  alt: string;
  priority?: boolean;
}) {
  return (
    <span className="shop-product-sprite" style={frameStyle(slot, row)}>
      <Image
        src={board}
        alt={alt}
        width={1254}
        height={1254}
        sizes="(max-width: 820px) 92vw, 540px"
        priority={priority}
        unoptimized
      />
    </span>
  );
}

export function AccessoryProductDetail({ locale, product }: { locale: Locale; product: AccessoryConceptProduct }) {
  const t = detailCopy[locale];
  const common = shopCopy[locale];
  const item = localizeAccessoryProduct(product, locale);
  const [activeView, setActiveView] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  function openZoom(row: number, opener: HTMLButtonElement) {
    openerRef.current = opener;
    setZoom(1);
    setActiveView(row);
  }

  function closeZoom() {
    setActiveView(null);
    setZoom(1);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  }

  useEffect(() => {
    if (activeView === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveView(null);
        setZoom(1);
        window.requestAnimationFrame(() => openerRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeView]);

  const direction = getAccessoryDirection(product.directionId);
  if (!direction) return null;
  const directionCopy = localizeAccessoryDirection(direction, locale);
  const board = accessoryDetailBoards[product.directionId];
  const guidance = choosingGuidance(item.kind, locale);
  const related = accessoryConceptProducts.filter(({ directionId, id }) => directionId === product.directionId && id !== product.id);

  return (
    <main className="shop-detail-shell" id="main-content" tabIndex={-1}>
      <header className="shop-detail-topbar">
        <Link href={`/${locale}`}><strong>{locale === "ko" ? "결 GYEOL" : "GYEOL"}</strong></Link>
        <Link href={`/${locale}/shop`}>← {t.shop}</Link>
      </header>

      <nav className="shop-detail-breadcrumb" aria-label={locale === "ko" ? "현재 위치" : "Breadcrumb"}>
        <Link href={`/${locale}/shop`}>{t.shop}</Link><span aria-hidden="true">/</span><span>{item.name}</span>
      </nav>

      <section className="shop-detail-hero" aria-labelledby="product-title">
        <button
          type="button"
          className="shop-detail-primary-image"
          aria-label={`${item.name} · ${t.views[0]} · ${t.zoomHint}`}
          onClick={(event) => openZoom(0, event.currentTarget)}
        >
          <ProductConceptImage board={board} slot={product.slot} row={0} alt={`${item.name} · ${t.views[0]}`} priority />
          <span>{common.conceptBadge}</span>
          <small>{t.zoomHint}</small>
        </button>
        <div className="shop-detail-summary">
          <p className="eyebrow">{t.concept} · {directionCopy.keyLabel}</p>
          <h1 id="product-title">{item.name}</h1>
          <p className="shop-detail-kind">{item.kind}</p>
          <p className="shop-detail-lead">{item.description}</p>
          <p className="shop-detail-price"><small>{t.price}</small><strong>{item.priceRange}</strong></p>
          <p className="shop-detail-unavailable" role="status">{t.unavailable}</p>
          <div className="shop-detail-boundary"><strong>{t.conceptNoticeTitle}</strong><p>{t.conceptNotice}</p></div>
        </div>
      </section>

      <section className="shop-detail-gallery" aria-labelledby="product-gallery-title">
        <header><p className="eyebrow">PRODUCT VIEWS</p><h2 id="product-gallery-title">{t.galleryTitle}</h2><p>{t.galleryBody}</p></header>
        <div>
          {t.views.map((label, row) => (
            <figure key={label}>
              <button
                type="button"
                className="shop-detail-angle"
                aria-label={`${item.name} · ${label} · ${t.zoomHint}`}
                onClick={(event) => openZoom(row, event.currentTarget)}
              >
                <ProductConceptImage board={board} slot={product.slot} row={row} alt={`${item.name} · ${label}`} />
                <span>{t.zoomHint}</span>
              </button>
              <figcaption><strong>{label}</strong><span>{t.viewDescriptions[row]}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="shop-detail-information" aria-labelledby="product-information-title">
        <div>
          <p className="eyebrow">PRODUCT NOTES</p>
          <h2 id="product-information-title">{t.overview}</h2>
        </div>
        <dl>
          <div><dt>{t.overview}</dt><dd>{item.description}</dd></div>
          <div><dt>{t.design}</dt><dd>{item.designDetails}</dd></div>
          <div><dt>{t.use}</dt><dd>{item.useScene}</dd></div>
          <div><dt>{t.care}</dt><dd>{item.careNote}</dd></div>
        </dl>
      </section>

      <section className="shop-choice-guide" aria-labelledby="product-choice-title">
        <header><p className="eyebrow">CHOOSING GUIDE</p><h2 id="product-choice-title">{t.choosingTitle}</h2><p>{t.choosingIntro}</p></header>
        <div>
          <article><span>01</span><h3>{t.fit}</h3><p>{guidance.fit}</p></article>
          <article><span>02</span><h3>{t.compare}</h3><p>{guidance.compare}</p></article>
          <article><span>03</span><h3>{t.confirm}</h3><p>{guidance.confirm}</p></article>
        </div>
      </section>

      <section className="shop-detail-order-boundary">
        <div><p className="eyebrow">MADE TO ORDER · CHECKOUT CLOSED</p><h2>{t.orderTitle}</h2></div>
        <p>{t.orderBody}</p>
      </section>

      <section className="shop-related-products" aria-labelledby="related-products-title">
        <header><h2 id="related-products-title">{t.related}</h2><Link href={`/${locale}/shop`}>{t.back}</Link></header>
        <div>
          {related.map((candidate) => {
            const relatedItem = localizeAccessoryProduct(candidate, locale);
            return (
              <article key={candidate.id}>
                <div className="shop-related-image">
                  <ProductConceptImage board={board} slot={candidate.slot} row={0} alt={`${relatedItem.name} · ${common.conceptBadge}`} />
                </div>
                <p>{relatedItem.kind}</p><h3>{relatedItem.name}</h3><strong>{relatedItem.priceRange}</strong>
                <Link href={`/${locale}/shop/${candidate.id}`}>{t.detail}</Link>
              </article>
            );
          })}
        </div>
      </section>

      {activeView !== null ? (
        <div className="shop-zoom-backdrop" onMouseDown={(event) => {
          if (event.currentTarget === event.target) closeZoom();
        }}>
          <section
            className="shop-zoom-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-zoom-title"
          >
            <header>
              <div>
                <p>{item.name}</p>
                <h2 id="shop-zoom-title">{t.zoomTitle}</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeZoom} aria-label={t.zoomClose}>×</button>
            </header>
            <nav aria-label={locale === "ko" ? "확대할 시점 선택" : "Choose a viewpoint"}>
              {t.views.map((label, row) => (
                <button
                  type="button"
                  key={label}
                  aria-pressed={activeView === row}
                  onClick={() => { setActiveView(row); setZoom(1); }}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="shop-zoom-stage" aria-live="polite">
              <div className="shop-zoom-canvas" style={{ width: `${zoom * 100}%` }}>
                <ProductConceptImage
                  board={board}
                  slot={product.slot}
                  row={activeView}
                  alt={`${item.name} · ${t.views[activeView]} · ${Math.round(zoom * 100)}%`}
                />
              </div>
            </div>
            <footer>
              <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.5))} disabled={zoom <= 1} aria-label={t.zoomOut}>−</button>
              <output aria-label={locale === "ko" ? "현재 확대율" : "Current zoom"}>{Math.round(zoom * 100)}%</output>
              <button type="button" onClick={() => setZoom((value) => Math.min(3, value + 0.5))} disabled={zoom >= 3} aria-label={t.zoomIn}>＋</button>
              <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1}>{t.zoomReset}</button>
            </footer>
          </section>
        </div>
      ) : null}
    </main>
  );
}
