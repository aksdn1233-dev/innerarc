import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccessoryProductDetail } from "@/components/accessory-product-detail";
import {
  accessoryConceptProducts,
  accessoryDetailBoards,
  getAccessoryConceptProduct,
  localizeAccessoryProduct,
} from "@/core/commerce/accessory-recommendations";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";

type ProductPageParams = { locale: string; productId: string };

export function generateStaticParams() {
  return (["ko", "en"] as const).flatMap((locale) =>
    accessoryConceptProducts.map(({ id }) => ({ locale, productId: id })),
  );
}

export async function generateMetadata({ params }: { params: Promise<ProductPageParams> }): Promise<Metadata> {
  const { locale, productId } = await params;
  if (!isLocale(locale)) return {};
  const product = getAccessoryConceptProduct(productId);
  if (!product) return {};
  const item = localizeAccessoryProduct(product, locale);
  const title = locale === "ko" ? `${item.name} 상세보기 | 태령당` : `${item.name} details | 태령당`;
  const description = locale === "ko"
    ? `${item.description} 정면·사선·측면 콘셉트와 선택 전 확인사항을 살펴보세요.`
    : `${item.description} Review front, three-quarter, and construction concepts plus selection checks.`;
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const imageUrl = new URL(accessoryDetailBoards[product.directionId], baseUrl).toString();
  return {
    title,
    description,
    keywords: locale === "ko"
      ? [item.name, item.kind, "사주 악세서리", "수비학 악세서리", "자동 생성 상품 콘셉트"]
      : [item.name, item.kind, "Saju accessory", "numerology accessory", "generated product concept"],
    alternates: {
      canonical: `/${locale}/shop/${product.id}`,
      languages: {
        ko: `/ko/shop/${product.id}`,
        en: `/en/shop/${product.id}`,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1254, height: 1254, alt: item.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default async function AccessoryProductPage({ params }: { params: Promise<ProductPageParams> }) {
  const { locale, productId } = await params;
  if (!isLocale(locale)) notFound();
  const product = getAccessoryConceptProduct(productId);
  if (!product) notFound();
  const item = localizeAccessoryProduct(product, locale);
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const pageUrl = new URL(`/${locale}/shop/${product.id}`, baseUrl).toString();
  const shopUrl = new URL(`/${locale}/shop`, baseUrl).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: item.name,
        description: item.description,
        inLanguage: locale === "ko" ? "ko-KR" : "en-US",
        image: new URL(accessoryDetailBoards[product.directionId], baseUrl).toString(),
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locale === "ko" ? "악세서리 상점" : "Accessory shop", item: shopUrl },
          { "@type": "ListItem", position: 2, name: item.name, item: pageUrl },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
      />
      <AccessoryProductDetail locale={locale} product={product} />
    </>
  );
}
