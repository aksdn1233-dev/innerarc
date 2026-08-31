import type { Metadata } from "next";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
import { BRAND_SEARCH_ALIASES } from "@/core/brand-links";
import { brandNameKo } from "@/core/brand";
import { resolvePublicAppUrl } from "@/core/site-url";
import "./globals.css";

const openGraphImage = {
  url: socialImagePath,
  alt: socialImageAlt,
  type: socialImageContentType,
  ...socialImageSize,
};

// Public ownership proof issued for mygyeol.kr by Naver Search Advisor.
const naverSiteVerification =
  process.env.NAVER_SITE_VERIFICATION ?? "7e543b74b6a17ebc6418e21aaf86beffd07b9614";

export const metadata: Metadata = {
  metadataBase: resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  title: `${brandNameKo} | 실제 삶으로 검증하는 개인 패턴 분석`,
  description:
    "결정론적 상징 분석을 가설로 제시하고 Reality Check와 실제 삶의 기록으로 개인 패턴을 검증합니다.",
  applicationName: brandNameKo,
  keywords: [
    ...BRAND_SEARCH_ALIASES,
    "사주",
    "무료 사주",
    "운세",
    "오늘의 운세",
    "운명수",
    "수비학",
    "궁합",
    "관계 리딩",
    "나의 성향",
    "나의 결",
    "나의 특징",
    "나의 장점",
    "타고난 성향",
    "타고난 기세",
    "Saju",
    "Numerology",
  ],
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    other: { "naver-site-verification": naverSiteVerification },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: brandNameKo,
    title: `${brandNameKo} | 실제 삶으로 검증하는 개인 패턴 분석`,
    description:
      "상징 분석을 가설로 보고, 실제 경험과 결과를 기록해 나만의 패턴을 검증해 보세요.",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandNameKo} | 실제 삶으로 검증하는 개인 패턴 분석`,
    description:
      "상징 분석을 가설로 보고, 실제 경험과 결과를 기록해 나만의 패턴을 검증해 보세요.",
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
