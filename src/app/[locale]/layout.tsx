import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
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
  return <div lang={locale}>{children}</div>;
}
