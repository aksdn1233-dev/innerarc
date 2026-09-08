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
import { getHomeFaq } from "@/i18n/home-faq";
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
  const pricing = resolveProductPricing();
  const campaign = pricing.campaign;
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
      // What is sold, in the words of a catalogue rather than a brochure. A crawler that
      // reads only this should still be able to say what this site offers and for how much.
      {
        "@type": "Service",
        "@id": `${baseUrl.origin}/#reading`,
        name: locale === "ko" ? "상세 리딩" : "Detailed reading",
        serviceType: locale === "ko"
          ? "생년월일 기반 개인 리딩"
          : "Personal reading from a birth date",
        description: locale === "ko"
          ? "생년월일로 연애·돈·일·공부에서 반복되는 흐름을 찾아 글로 정리하고, 숫자가 나온 계산 근거를 함께 공개합니다."
          : "Finds the patterns that repeat in love, money, work and study from a birth date, in writing, with the calculation behind every number shown.",
        provider: { "@id": `${baseUrl.origin}/#organization` },
        areaServed: "KR",
        offers: {
          "@type": "Offer",
          price: String(pricing.prices.pro_30d),
          priceCurrency: "KRW",
          availability: "https://schema.org/InStock",
          url: new URL(`/${locale}/plans`, baseUrl).toString(),
        },
      },
      // Only ever the questions the page itself shows: structured data that answers
      // something a reader cannot find on the page is the thing search engines penalise.
      {
        "@type": "FAQPage",
        "@id": `${homeUrl}#faq`,
        mainEntity: getHomeFaq(locale, pricing.prices.pro_30d).map(
          ([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          }),
        ),
      },
    ],
  };
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags -- Locale-only loading keeps the Korean font payload off English routes. */}
      {locale === "ko" && <link rel="stylesheet" href="/fonts/pretendard/pretendard-dynamic.css" />}
      <div lang={locale} className={locale === "ko" ? "pretendard-locale" : undefined}>
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
    </>
  );
}
