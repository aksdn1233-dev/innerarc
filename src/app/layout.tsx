import type { Metadata } from "next";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
import { resolvePublicAppUrl } from "@/core/site-url";
import "./globals.css";

const openGraphImage = {
  url: socialImagePath,
  alt: socialImageAlt,
  type: socialImageContentType,
  ...socialImageSize,
};

export const metadata: Metadata = {
  metadataBase: resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  title: "결 GYEOL | 사주·수비학으로 보는 나·관계·운세",
  description:
    "생년월일 기반 사주와 수비학을 서로 분리해 성향·관계·운세의 흐름을 정리하는 상징적 자기 성찰 리딩 서비스.",
  applicationName: "결 GYEOL",
  keywords: [
    "사주",
    "무료 사주",
    "운세",
    "오늘의 운세",
    "운명수",
    "수비학",
    "궁합",
    "관계 리딩",
    "Saju",
    "Numerology",
  ],
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NAVER_SITE_VERIFICATION
      ? { other: { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION } }
      : {}),
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "결 GYEOL",
    title: "결 GYEOL | 사주·수비학으로 보는 나·관계·운세",
    description:
      "사주와 수비학을 분리해 나의 성향, 관계, 오늘과 올해의 흐름을 상징적으로 살펴보세요.",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "결 GYEOL | 사주·수비학으로 보는 나·관계·운세",
    description:
      "사주와 수비학을 분리해 나의 성향, 관계, 오늘과 올해의 흐름을 상징적으로 살펴보세요.",
    images: [openGraphImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기 / Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
