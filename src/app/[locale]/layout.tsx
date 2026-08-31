import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
import { BRAND_SEARCH_ALIASES, OFFICIAL_NAVER_BLOG_URL } from "@/core/brand-links";
import { brandNameKo } from "@/core/brand";
import { ContentProtectionNotice } from "@/components/content-protection-notice";
import { JourneyAnalytics } from "@/components/journey-analytics";
import { resolveProductPricing } from "@/core/product-prices";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale, locales } from "@/i18n/config";
import { getLocalizedSiteMetadata } from "@/i18n/site-metadata";

const openGraphImage = {
  url: socialImagePath,
  alt: socialImageAlt,
  type: socialImageContentType,
  ...socialImageSize,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getLocalizedSiteMetadata(locale);

  return {
    title: copy.title,
    description: copy.description,
    keywords: locale === "ko"
      ? [
          ...BRAND_SEARCH_ALIASES,
          "나의 성향",
          "나의 결",
          "나의 특징",
          "나의 장점",
          "타고난 성향",
          "타고난 기세",
          "사주",
          "무료 사주",
          "운세",
          "오늘의 운세",
          "운명수",
          "수비학",
          "궁합",
          "관계 리딩",
        ]
      : [...BRAND_SEARCH_ALIASES, "Saju", "Four Pillars", "numerology", "daily flow", "relationship reading"],
    openGraph: {
      type: "website",
      siteName: brandNameKo,
      title: copy.title,
      description: copy.description,
      locale: copy.openGraphLocale,
      alternateLocale: [copy.alternateOpenGraphLocale],
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [openGraphImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const homeUrl = new URL(`/${locale}`, baseUrl).toString();
  const copy = getLocalizedSiteMetadata(locale);
  const campaign = resolveProductPricing().campaign;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl.origin}/#organization`,
        name: brandNameKo,
        alternateName: BRAND_SEARCH_ALIASES,
        url: baseUrl.origin,
        logo: new URL("/icon.png", baseUrl).toString(),
        sameAs: [OFFICIAL_NAVER_BLOG_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl.origin}/#website`,
        name: brandNameKo,
        alternateName: BRAND_SEARCH_ALIASES,
        url: homeUrl,
        description: copy.description,
        inLanguage: locale === "ko" ? "ko-KR" : "en-US",
        publisher: { "@id": `${baseUrl.origin}/#organization` },
      },
    ],
  };
  return (
    <div lang={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }}
      />
      <JourneyAnalytics locale={locale} />
      {campaign && (
        <nav className="campaign-utility-nav" aria-label={locale === "ko" ? "행사, 후기와 도움말" : "Campaign, reviews and help"}>
          <Link href={`/${locale}/events`} prefetch={false}>{locale === "ko" ? "이벤트" : "Events"}</Link>
          <Link href={`/${locale}/reading#evidence`} prefetch={false}>{locale === "ko" ? "후기" : "Reviews"}</Link>
          <Link href={`/${locale}/events#faq`} prefetch={false}>FAQ</Link>
        </nav>
      )}
      {children}
      <ContentProtectionNotice locale={locale} />
    </div>
  );
}
