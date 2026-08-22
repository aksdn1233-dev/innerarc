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
  const title = locale === "ko" ? `${item.name} 상세보기 | 결 GYEOL` : `${item.name} details | GYEOL`;
  const description = locale === "ko"
    ? `${item.description} 정면·사선·측면 콘셉트와 선택 전 확인사항을 살펴보세요.`
    : `${item.description} Review front, three-quarter, and construction concepts plus selection checks.`;
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const imageUrl = new URL(accessoryDetailBoards[product.directionId], baseUrl).toString();
  return {
    title,
    description,
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
  return <AccessoryProductDetail locale={locale} product={product} />;
}
