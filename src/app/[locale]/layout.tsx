import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
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
      ? ["사주", "무료 사주", "운세", "오늘의 운세", "운명수", "수비학", "궁합", "관계 리딩"]
      : ["Saju", "Four Pillars", "numerology", "daily flow", "relationship reading"],
    openGraph: {
      type: "website",
      siteName: "결 GYEOL",
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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl.origin}/#organization`,
        name: "결 GYEOL",
        url: baseUrl.origin,
        logo: new URL("/icon.png", baseUrl).toString(),
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl.origin}/#website`,
        name: "결 GYEOL",
        alternateName: locale === "ko" ? "결" : "GYEOL",
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
      {children}
    </div>
  );
}
