import { notFound } from "next/navigation";
import { ShopExperience } from "@/components/shop-experience";
import { isLocale } from "@/i18n/config";
import { shopCopy } from "@/i18n/shop-copy";

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ShopExperience locale={locale} copy={shopCopy[locale]} />;
}
